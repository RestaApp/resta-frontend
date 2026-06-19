# Тикет 3 — Смены не переходят `filled → completed` (отзывы не разблокируются)

**Тип:** bug / infra
**Приоритет:** высокий

## Проблема
Прошедшие смены остаются в статусе `filled` и не переходят в `completed`. Блупринт отдаёт поля отзыва только `if shift.completed?` (`app/blueprints/shift_blueprint.rb:49-63`):
```ruby
field :can_leave_review, if: ->(_f, shift, _opts) { shift.completed? && shift.user.restaurant? }
field :review_target,    if: ->(_f, shift, _opts) { shift.completed? && shift.user.restaurant? }
field :my_review,        if: ->(_f, shift, _opts) { shift.completed? && shift.user.restaurant? }
```
Из-за этого на фронте не появляется кнопка «Оставить отзыв» (`ShiftReviewSection` скрывает блок, когда полей нет).

## Пример
Shift id **376**: `end_time = 2026-06-19 07:44`, спустя >2ч `status` всё ещё `filled`, `completed_at` пустой. Заявка сотрудника `accepted`, владелец смены — ресторан (id 639). Поля `can_leave_review` / `review_target` / `my_review` в `GET /shifts/376` отсутствуют.

## Причина (предположительно)
Джоб `CompleteFinishedShiftsJob` (`config/schedule.rb`, раз в час) фактически не выполняется на Render: не запущен Sidekiq-воркер и/или whenever-cron. Логика самого джоба корректна (`status: filled` + `end_time < now` → `completed`, рассылка review-уведомлений).

## Что сделать
1. Поднять/починить **Sidekiq-воркер** и cron-вызов `CompleteFinishedShiftsJob` (раз в час) на проде.
2. Разово прогнать для зависших смен: `CompleteFinishedShiftsJob.perform_now`.
3. Проверить парный `ExpireOpenShiftsJob` — вероятно тоже не отрабатывает.

## Критерий готовности
- Через ≤1ч после `end_time` смена сама становится `completed`, приходят review-уведомления.
- `GET /api/v1/shifts/:id` начинает отдавать `can_leave_review: true` + `review_target` участнику.

## Правила отзыва (для проверки, `app/services/review_eligibility_checker.rb`)
1. смена `completed`; 2. прошло < 7 дней; 3. владелец — ресторан; 4. отзыв ещё не оставлен; 5. ревьюер — выбранный сотрудник или ресторан-владелец.

## Контекст
Фронт ведёт себя корректно — лишь скрывает CTA, пока бэк не отдал поля. Правок не требует.
