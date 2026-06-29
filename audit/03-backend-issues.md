# C. Backend issues

## Безопасность (все P0 верифицированы вручную)

### C1 (P0) — PII всех пользователей доступен любому авторизованному
`app/blueprints/user_blueprint.rb:7-9` отдаёт `phone`, `email`, `telegram_id` в **default**-view. `users#show` (`app/controllers/api/v1/users_controller.rb:27-37`) рендерит default, `UserPolicy#show?` (`app/policies/user_policy.rb:9-11`) требует лишь `user_present?`. Итог: `GET /users/:id` отдаёт телефон+email+telegram_id любого пользователя любому авторизованному (включая `unverified`). Это и IDOR/сбор PII, и нарушение правила монетизации «контакты только избранному/принятому/PRO».
→ Вынести контакты из default-view; завести `:contact`-view, отдавать только при accepted-application/PRO; добавить гейтинг в `UserPolicy#show?`.

### C2 (P0) — Telegram-действия с тикетами без авторизации
`app/services/telegram/ticket_callback_handler.rb:23-205` и `update_router_helpers.rb:130-181` обрабатывают `tk:<id>:<action>` (взять в работу, закрыть, переоткрыть, ответить, посмотреть профиль/историю) без проверки, что отправитель — член команды. «Админ» выводится из `callback_query['from']['id']`. `handle_profile`/`handle_history` сливают PII любого юзера.
→ Allowlist admin Telegram ID / проверка против `TELEGRAM_TEAM_CHAT_ID` перед любым `tk:`-действием и reply-mode.

### C3 (P0) — Mass-assignment + обход eligibility при update отзыва
`app/controllers/api/v1/reviews_controller.rb:42-49` делает `@review.update(review_params)`, где `review_params` (64-68) разрешает `reviewed_id/reviewable_type/reviewable_id/rating`. `ReviewPolicy#update?` (`app/policies/review_policy.rb:25-27`) проверяет только авторство, не дёргает `ReviewEligibilityChecker` (только `create?`) и не форсит `Review#can_edit?` (pending + <24h). Можно перенаправить одобренный отзыв на произвольного юзера/смену и изменить рейтинг.
→ Разрешать только `rating/comment/anonymous`; форсить `can_edit?`; ревалидация eligibility при изменении target-полей.

### C4 (P0) — Деактивированный пользователь сохраняет доступ
`app/controllers/application_controller.rb:25-37`: `authenticate_user!` принимает любой валидный непросроченный JWT; `current_user` делает `User.find` без проверки `active`. Колонка `users.active` есть, политики гейтят запись на `user_active?`, но чтения (тот же `show`) и сама сессия валидны 24ч. Отзыва токенов нет.
→ Отклонять при отсутствии/`!active?`; рассмотреть jti-денилист / короткий TTL + refresh.

### C5 (P1) — Самоэскалация роли + «restaurant = админ»
- `app/services/user_update_service.rb:59-67,99-104`: `can_change_role?` позволяет `unverified` назначить себе **любую** роль (включая `restaurant`/`supplier`+авто-триал) без верификации.
- `app/controllers/api/v1/cache_controller.rb:21-25` (подтверждено): `authorize_admin!` пускает в `POST /cache/clear` любого с `role == 'restaurant'` → сброс всех кэшей (DoS-вектор). Реальной admin-роли нет.

→ Реальный admin-гейт (env/credentials allowlist, не равенство строки роли); серверная верификация назначения роли.

### C6 (P1) — `available_employees` ломает приложение
Роут `config/routes.rb:23` маппит `GET /users/available_employees` на несуществующий экшен → `ActionNotFound`/500 при вызове. `UserPolicy#available_employees?` определён, но мёртв (нарушение YAGNI).
→ Реализовать экшен или удалить роут + мёртвый метод политики.

### C7 (P1) — Telegram initData: `==` вместо constant-time + пропуск timestamp
`app/services/telegram_auth_validator.rb`:
- строка 47 — `expected_hash == received_hash` (не constant-time сравнение подписи).
- строки 57-67 — `validate_timestamp?` возвращает `true` при отсутствии `auth_date` → форжед-payload без `auth_date` обходит проверку свежести/replay.

→ `ActiveSupport::SecurityUtils.secure_compare` (как уже корректно сделано в webhook-контроллере); обязательный `auth_date`, отклонять при отсутствии; рассмотреть сужение 24h-окна.

## База данных

| # | Sev | Проблема | Файл | Фикс |
|---|---|---|---|---|
| C8 | P1 | `users.username` — индекс **не уникальный** при `validates uniqueness` → гонка дублей | `structure.sql:1800`, `user.rb:50` | partial unique index `WHERE username IS NOT NULL` |
| C9 | P1 | `shift_applications` без DB-unique на `(user_id, shift_id)` → две параллельные заявки | `shift_application.rb:44-58` | partial unique index |
| C10 | P1 | N+1: `my_shifts`/`applied_shifts` не прегружают `selected_applicant`, лениво грузимый в `ShiftBlueprint` | `app/queries/shifts_query.rb:51,67`, `concerns/shift_reviewable.rb` | `includes(selected_applicant: …)` |
| C11 | P1 | Нет CHECK на деньгах (`purchases.stars_paid`, `subscriptions.stars_paid`, `shifts.payment`) и на `reviews.rating BETWEEN 1 AND 5` | schema | добавить CHECK-констрейнты |
| C12 | P1 | `GrantTrialService` (`Subscription.create!`) внутри транзакции обновления профиля: сбой триала откатит легитимный апдейт | `app/services/user_update_service.rb:87,158` | вынести trial за транзакцию апдейта |
| C13 | P2 | `analytics/track_service.rb:74,82` — create-event + инкремент счётчика двумя необёрнутыми записями | `app/services/analytics/track_service.rb` | обернуть в транзакцию |

## Качество кода

- **Дублирование (P2):** `shift_filter_service.rb` и `queries/shifts_query.rb` — почти идентичная фильтрация.
- **Мёртвый код (P1/P2):** `available_employees` (роут+политика); `Review#approve?/reject?/hide?` (`app/models/review.rb:76-96`) — TODO, не вызываются ниоткуда (нарушение YAGNI).
- **Policy no-ops:** `PurchasePolicy#index?`/`SubscriptionPolicy#current?` возвращают `true` (контроллеры само-скоупятся, но политика ничего не форсит).
- **Layering:** контроллеры тонкие; исключение — Telegram-слой (`update_router.rb` 316 LOC держит бизнес-логику тикетов).

## Положительное

SQL везде параметризован, `sanitize_sql_like` на ILIKE, ORDER BY фиксированный (нет инъекции), все FK проиндексированы, idempotency-индексы на платежах (`telegram_payment_id`), one-active-subscription partial unique, секреты gitignored, webhook secret через `secure_compare` (fail-closed), JWT HS256 с секретом из credentials/ENV (в production падает если не задан).
