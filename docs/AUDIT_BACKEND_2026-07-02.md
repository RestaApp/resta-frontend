# Pre-Production Audit: resta_backend (Rails API) + кросс-чек с фронтендом

**Дата:** 2026-07-02 · **Метод:** статическое чтение (Ruby локально недоступен — rspec/rubocop прогоняет CI). Пути — относительно `resta_backend/`.

---

## P1 — исправить до запуска

### B1. Гонка при конкурентном accept двух заявок на одну смену (нет блокировки)
**Confidence: high** · `app/services/accept_shift_application_service.rb:15-51`

```ruby
return validation_failed(:not_pending) unless shift_application.pending?
return validation_failed(:shift_not_open) unless shift_application.shift.open?
accept_in_transaction  # transaction { accept_application!; fill_shift! } — без shift.lock!/reload
```

Guard'ы `pending?`/`open?` выполняются на незаблокированных объектах **до** транзакции. Два конкурентных accept разных заявок оба проходят `shift.open?` и оба коммитятся: две заявки в `accepted`, `selected_applicant_id` = последний писатель, оба сотрудника получают уведомление «принят» и оба приходят на смену. DB-ограничений на переход статуса нет (`shifts.status` — plain string).

**Fix:** внутри транзакции `shift.lock!` + повторная проверка `open? && shift_application.reload.pending?`, либо `Shift.where(id:, status: :open).update_all(...)` с проверкой затронутых строк.

### B2. Конкурентный boost одной смены сжигает два платных слота `urgent_boost`
**Confidence: high** · `app/services/shifts/boost_service.rb:31-43` (подтверждено двумя независимыми агентами)

```ruby
return ServiceResult.success(@shift) if @shift.urgent?   # idempotency guard ДО транзакции
ActiveRecord::Base.transaction do
  @user.lock!            # @shift не перечитывается и не блокируется
  @shift.update!(urgent: true, ...)
  consume_result = consume_boost(was_within_limit)        # consume второго purchase
```

Два конкурентных `PATCH /shifts/:id/boost` оба читают `urgent? == false`, сериализуются на `user.lock!` — второй повторно проходит update + `ConsumeSlotService` и потребляет **второй** оплаченный `urgent_boost` (100 Stars) за тот же буст. Последовательный retry (фронтовый poll-with-backoff) безопасен — возвращает 200 без повторного consume.
**Fix:** `@shift.reload`/`lock!` + `return success if urgent?` внутри транзакции после `user.lock!`.

### B3. Refund пакетов contact-reveal не обрабатывается вовсе
**Confidence: high** · `app/services/payments/process_refund_service.rb:36-44`

Ищутся только `Subscription.find_by(telegram_payment_id:)` и `Purchase.find_by(...)`; `ContactRevealPackage` (хранит `telegram_payment_id`, unique index `structure.sql:1353`) не проверяется. Stars-возврат за `contact_reveal_pack_10/30/50` уходит в `log_unknown_charge` — пакет остаётся `active`: пользователь сохраняет и reveals, и деньги.
**Fix:** добавить ветку `ContactRevealPackage` (expired/refunded).

### B4. Молчаливая потеря платежа при провале lookup user/plan — без retry и алерта
**Confidence: med-high** · `app/services/payments/process_payment_service.rb:29-33` (`return nil unless user && plan`), аналогично `process_purchase_payment_service.rb:41`

Если план деактивирован (`Plan.active_plans.find_by`) или пользователь удалён между инвойсом и оплатой — метод возвращает `nil` **без raise**, поэтому rescue в `UpdateRouter#process_successful_payment` (`telegram/update_router.rb:227-230`) не планирует `ProcessPaymentRetryJob` и `ErrorNotifier` не срабатывает. Stars списаны, ничего не начислено, следов нет. Смежное: неизвестный `purchase_type` → `RecordInvalid` → retry-job 5 раз ретраит детерминированный провал (`process_payment_retry_job.rb:10`) и молча дропает.
**Fix:** raise/notify вместо `nil`; алерт при исчерпании ретраев.

---

## P2

| # | Находка | Evidence | Confidence |
|---|---|---|---|
| B5 | Отклик на soft-deleted смену: `Shift.find` без `.kept`, destroy делает только `discard` (status остаётся `open`), `ShiftPolicy#apply?` проверяет лишь `open?` → заявка создаётся, ресторан получает уведомление об удалённой смене | `shift_applications_controller.rb:82`, `shifts_controller.rb:94`, `shift_policy.rb:39-44` | High |
| B6 | Нет unique-индекса на `shift_applications(user_id, shift_id)` — уникальность только app-level валидацией; конкурентный double-tap создаёт дубли pending-заявок | `db/structure.sql:1581-1612`, `shift_application.rb:44-58` | High |
| B7 | `PATCH /shifts/:id` — деструктивная полная перезапись: атрибуты `ShiftForm` по умолчанию `nil` и пишутся все; PATCH без `payment`/`start_time` обнуляет колонки. Плюс `start_time_in_future` в форме срабатывает безусловно (в отличие от change-aware модели) — смена с прошедшим стартом нередактируема вообще | `app/forms/shift_form.rb:31-75,89-95` vs `shift.rb:124-130` | High |
| B8 | Политика cancel противоречит модели и API.md: owner-cancel и отмена accepted-заявки недостижимы (403), 8-часовой дедлайн и `:too_late_accepted` — мёртвый код; reopen реально работает только через reject | `shift_application_policy.rb:8-15` vs `shift_application.rb:111-145`, API.md:1005 | High |
| B9 | Review UPDATE: `review_params` разрешает `reviewed_id/reviewable_*/rating`, а `update?` проверяет только авторство — автор может перенацелить отзыв на другого пользователя в обход eligibility (проверяется только на create); `can_edit?`/`can_delete?` модели нигде не вызываются; auto-approve + пересчёт `average_rating` жертвы | `reviews_controller.rb:43-50,65-69`, `review_policy.rb:22-24`, `review.rb:54-55,66-72,114-127` | High |
| B10 | Битые маршруты `users#profile` и `users#available_employees` — объявлены в routes, actions не существуют → 500 (generic) + шум в Sentry | `config/routes.rb:22-27`, `users_controller.rb:8` | High |
| B11 | N+1 в `GET /reviews`: `includes(:reviewer, :reviewed)` не прогружает вложенные профили и ActiveStorage-фото, которые тянет `UserBlueprint` default view | `reviews_controller.rb:12-19`, `review_blueprint.rb`; ср. корректный `user_scopes.rb:15-17` | High |
| B12 | Русские строки в API-ошибках вопреки контракту «API errors — English» (API.md:150-157): role-mismatch base-ошибки профилей; `SupportTicket#check_rate_limit` в локали пользователя | `employee_profile.rb:29`, `restaurant_profile.rb:19`, `supplier_profile.rb:35`, `support_ticket.rb:117` | High |
| B13 | Регистрация не фиксирует согласие с legal/privacy на сервере — ни колонки, ни таймстампа (consent только на клиенте) | `user_authentication_service.rb:79-95`; grep по schema — пусто | High |
| B14 | Checkout покупок без dedupe: каждый `POST /purchases/checkout` мятит новый инвойс; `pre_checkout` не отклоняет при уже имеющемся неизрасходованном purchase того же типа → случайная двойная оплата возможна (пользователь получит два stackable-слота, не потеряет деньги «за один слот», но и защиты нет) | `create_purchase_invoice_service.rb`, `pre_checkout_service.rb:22-30` | High |

## P3

- **HMAC initData сравнивается не constant-time** (`telegram_auth_validator.rb:47` — plain `==`; нужно `secure_compare`). TTL `auth_date` — 24ч и пропускается при отсутствии `auth_date` (`:56-67`) — leaked initData реплеится сутки.
- **`username`: уникальность только на модели**, DB-индекс неуникальный (`user.rb:50` vs `structure.sql:1934`), при этом поле перезаписывается на каждом логине (`user_authentication_service.rb:107-118`).
- **Дубли активных вакансий**: `no_duplicate_active_shift` (`shift.rb:145-170`) без DB-constraint — гонка при конкурентных create.
- **Мёртвая колонка** `shifts.applications_count` — counter_cache не подключён, blueprint считает `active_applications_count` сам (`shift_blueprint.rb:23-26`).
- **`my_shifts`/`applied_shifts` без пагинации** — raw relation, meta не отдаётся (`shifts_query.rb:38-57`, `application_controller.rb:174-178`).
- **Накрутка аналитики**: `analytics/track` принимает произвольный `trackable_id`; `contact_clicked` без dedup, `profile_viewed` инкрементит чужой счётчик (`analytics_controller.rb:53-61`, `track_service.rb:63-90`). Целостность платной аналитики поставщиков.
- **`Rails.cache.delete_matched`** в payment/refund-сервисах (`process_payment_service.rb:106`) — не поддерживается частью cache-store'ов, O(keys) на Redis.
- **402 contact-reveal неконсистентен**: уходит через `render_error` без `purchase_type`/`price` (`users_controller.rb:52-59`) — фронтовый `parsePaymentRequired` вернёт null (у shifts/boost форма полная и совпадает: `monetization_checks.rb:66-77`).
- **API.md**: документирует несуществующий `POST /shifts/:id/apply` (API.md:797 vs `routes.rb:43-52`); reopen-через-owner-DELETE невозможен (см. B8); правило apply «нет pending-заявки» — фактически блокирует и rejected (`shift_application.rb:49-53`): отклонённый кандидат не может откликнуться повторно — подтвердить как продуктовое решение.
- **Нет `after_action :verify_authorized`** — пропуски `authorize` молчаливы (`mark_all_read`/`has_unread` сегодня безопасны за счёт scoping).

## Проверено и чисто

- **Webhook-платежи:** секрет `X-Telegram-Bot-Api-Secret-Token` через `secure_compare`, 500 при отсутствии (`telegram/webhooks_controller.rb:62-79`); идемпотентность дублей `successful_payment` — partial unique индексы на `telegram_payment_id` (purchases/subscriptions/packages) + `rescue RecordNotUnique`; один active/trial sub на пользователя (`index_subscriptions_unique_current_per_user`).
- **Consume слотов:** `available.by_type(...).lock.first` в транзакции (`consume_slot_service.rb:33-38`) — корректно под Postgres; `CreateService` лочит user перед limit-check.
- **Авторизация:** IDOR не найден в shifts/applications/notifications/purchases/subscriptions/analytics (везде scoping на `current_user` / policy-проверки владения); apply к своей смене заблокирован дважды; `pre_checkout` отклоняет оплату чужого инвойса (`from.id` vs payload `telegram_id`).
- **JWT** (HS256, 24h, секрет из credentials/ENV), **rack-attack** (300/min глобально, 10/min auth), **reveal-contact** (row lock + FEFO + unique index), **секреты** (`master.key`/`.env` в .gitignore, не в git). **Money math:** цены из `Plan` JSONB, `pre_checkout` сверяет `total_amount` с текущей ценой плана.
- **N+1 списков смен** — прогрузки на месте, blueprint ветвится на `loaded?`.

---

## Кросс-чек: фронтенд-аудит ↔ бэкенд

| Фронтовая находка | Вердикт | Evidence |
|---|---|---|
| Кламп `per_page` = 100 + pagination meta (P1 №1, цикл пагинации) | **CONFIRMED** — кламп есть (`shifts/list_entrypoint.rb:23-27` + Kaminari `max_per_page = 100` глобально); meta полная, включая `next_page` (`application_controller.rb:180-189`). Бесконечный цикл фронта при >100 элементов **реален**; чинить фронт (у бэка уже есть `next_page` для правильной пагинации) | agents 1,2 |
| `DELETE /api/v1/users/:id` (P1 №2, удаление аккаунта) | **ХУЖЕ, чем думали: эндпоинта не существует.** Routes: только `index show update` (`routes.rb:20`); `UserPolicy#destroy? → false` («Users cannot be deleted», `user_policy.rb:18-20`). Даже после проводки фронта — 404. Удаление аккаунта отсутствует end-to-end; при будущей реализации учесть: `dependent: :destroy` каскадит, анонимизации нет | agent 1 |
| Архивация уведомлений (P1 №3) | Бэкенд корректен: `PATCH /notifications/:id` меняет статус, `GET` пагинируется штатно; ничего не смягчает фронтовую порчу кэша — **баг чисто фронтовый**, чинить на фронте | agent 1 |
| `200 + success: false` (P2 №17, prefs; №24 updateUser) | **REFUTED** — такого пути нет: провалы всегда 422 через `render_errors`, `render_success` всегда `success: true` (`users_controller.rb:80`, `notification_preferences_controller.rb:15-19`). Фронтовые проверки `response.success` — защитные, но ветка `success: false` при 200 не срабатывает никогда. Баг №17 (сброс draft до проверки) остаётся плохим паттерном, но не воспроизводится с текущим бэком | agent 1 |
| Error-string sniffing: `'phone has already been taken'` (P3) | **REFUTED** — у phone нет uniqueness-валидации (только формат, `user.rb:54-56`), индекс неуникальный: бэк никогда не эмитит эту строку. Фронтовый маппер мёртв для phone. `'телефон'/'город'` в API не приходят (только в Telegram-уведомлениях), **но** русские role-mismatch ошибки в API есть (B12). Стабильные `code` — только `purchase_required`/`profile_incomplete`/`validation`/`duplicate_vacancy`; полевые ошибки кода не несут | agent 1 |
| `'shift is not open for accepting applications'` sniffing (P3) | **CONFIRMED с ловушкой:** точная строка — `"Shift is not open..."` с заглавной S (`en.yml:72`), без `code`; фронт обязан lowercase'ить (он это делает). Строка приходит из **accept**; отказ apply по закрытой смене — Pundit 403, другой формат. Просить у бэка `code: shift_not_open` | agent 2 |
| 402 на apply-to-shift (P2 №12) | **REFUTED (фронт корректен сегодня):** 402 эмитят ровно три места — shifts#create, shifts#boost (`monetization_checks.rb:74`, `shift_creation_helpers.rb:42`) и contact reveal (`users_controller.rb:58`). Apply не монетизирован — отсутствие 402-flow на apply не баг; зафиксировать в HANDOFF.md | agents 2,3 |
| `errors: []` при 201 (P2 №13) | **REFUTED:** на 2xx ключа `errors` не бывает (`{success: true, data}`), `errors` — только на 4xx и всегда непустой. Фронтовый guard `!!r.errors` мёртв, но и не выстрелит; всё равно убрать | agent 2 |
| Boost double-charge (P2 №7-№10 фронта) | **PARTIAL:** последовательный retry безопасен (идемпотентный 200), но конкурентный дубль сжигает два слота (B2) — фронтовый баг re-entry №7 **имеет реальную денежную цену**. Checkout-dedupe отсутствует (B14) — фронтовое окно double-pay №10 бэком не прикрыто | agents 2,3 |
| Post-payment 402-polling ≤15.5с (окно `waitWithBackoff`) | **PARTIAL OK:** happy path синхронен внутри webhook-запроса (Purchase создаётся до ответа Telegram) — укладывается с запасом. Forever-402: (1) провал процессинга → `ProcessPaymentRetryJob` с polynomially_longer (второй ретрай уже за окном фронта); (2) молчаливый nil из B4; (3) слот съеден параллельным действием | agent 3 |
| `subscriptions/current` после оплаты | **CONFIRMED immediate:** подписка создаётся сразу `status: 'active'` в webhook (`process_payment_service.rb:66-86`); processing-состояния нет. Каёват: subscription checkout за Flipper-флагом `monetization_suppliers_enabled` | agent 3 |
| Форма 402-body vs `parsePaymentRequired` | **CONFIRMED для shifts/boost** (`{success, error, feature, upgrade_available, purchase_type, price, code}` — совпадает), **расходится для contact reveal** (без `purchase_type`/`price` — parse вернёт null) | agent 3 |
| Accept авто-реджектит остальные заявки? (фронтовый statusOverride, P3) | **REFUTED:** не реджектит — остальные pending остаются pending до bulk-cancel джобами после `end_time` (`accept_shift_application_service`, `complete_finished_shifts_job.rb:77-84`; так и задокументировано в API.md:994-1003). Фронтовое опасение про затенение override'ами серверных статусов — неактуально для этого сценария, но валидно для reopen-через-reject | agent 2 |
| Приглашение создаёт заявку? (P3, `locallyUnapplied`) | **REFUTED:** фичи приглашений на бэке нет вообще (grep по `invit` — ноль вхождений); маскировка невозможна | agent 2 |
| Редактирование прошедших смен (P2 №14) | **CONFIRMED — блокируют оба, бэк агрессивнее:** форма 422-ит даже неизменённый прошедший `start_time` (`shift_form.rb:89-95`), а пропуск `start_time` включает деструктивную перезапись B7. Клиентский блок фронта — единственная защита от потери данных; не убирать до фикса B7 | agent 2 |
| Согласие фиксируется только на клиенте (Legal, продуктовое решение) | **CONFIRMED** (B13) | agent 1 |

---

## Приоритеты бэкенда до продакшена

1. **B1** — lock в accept (двойное принятие на смену — прямой операционный инцидент).
2. **B2 + B14** — идемпотентность boost внутри транзакции + dedupe checkout (деньги пользователей).
3. **B3, B4** — refund пакетов и алертинг потерянных платежей (деньги + доверие).
4. **B9** — закрыть mass assignment в reviews update (целостность рейтингов).
5. **B6, B5** — unique index на заявки, `.kept` в apply.
6. **B7/B8** — семантика PATCH и политика cancel (согласовать с API.md, править вместе с фронтовым №14).
7. Контракты: добавить `code` полевым/доменным ошибкам (убьёт весь string-sniffing фронта), убрать русские строки из API (B12), убрать мёртвый `POST /shifts/:id/apply` из API.md.
