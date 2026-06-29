# F. Refactoring plan (пошагово)

Порядок выбран по принципу «сначала безопасность и целостность данных, потом контракт, потом гигиена».

1. **Безопасность контактов (C1 / E)** — вынести `phone/email/telegram_id` из default-view `UserBlueprint`, ввести `:contact`-view, отдавать только при accepted-application/PRO; добавить гейт в `UserPolicy#show?`; на FE — locked-state вместо `tel:`/`mailto:`.

2. **Авторизация Telegram-тикетов (C2)** — allowlist admin ID перед любым `tk:`-действием и reply-mode в `ticket_callback_handler.rb` / `update_router_helpers.rb`.

3. **Review update (C3)** — сузить strong-params до `rating/comment/anonymous`, форсить `can_edit?`/eligibility в `ReviewPolicy`.

4. **Сессии и роли (C4 / C5)** — отклонять JWT неактивных в `application_controller`, ввести реальный admin-гейт (заменить `role=='restaurant'` в `cache_controller`), закрыть самоэскалацию роли в `user_update_service`.

5. **initData (C7)** — `secure_compare` + обязательный `auth_date` в `telegram_auth_validator`.

6. **DB-инварианты (C8–C12)** — partial unique-индексы (username; user_id+shift_id), CHECK на деньги/рейтинг, вынести `GrantTrialService` из транзакции апдейта профиля. Все миграции — zero-downtime (`algorithm: :concurrently`, `disable_ddl_transaction!`).

7. **Контрактные правки (D1–D3)** — `per_page` в `getMyShifts`, переименовать `total_views→views` в `SupplierAnalyticsMonth`, убрать `urgent` из create-body.

8. **Архитектурная гигиена** — вынести monetization-поверхности в `shared/` (A1), дедуп фильтрации shifts (`shift_filter_service` ⨉ `shifts_query`, A2), разнести god-hooks и крупные файлы (B4/B5).

9. **Уборка мёртвого кода** — `available_employees` (роут+политика, C6), invite-мутация/дровер (D4), barrel `add-shift/fields` (B7), фантомы в `API.md`/`HANDOFF.md` (D8).

## Принципы

- Каждый шаг — отдельный коммит/PR с тестами (см. [08-testing-plan.md](08-testing-plan.md)).
- Перед коммитом FE: `npm run lint` → `format:check` → `build`. BE: `rspec` → `rubocop` (запускает пользователь/CI — Ruby локально недоступен).
- Шаги 1–5 не зависят друг от друга и могут идти параллельно; 6 после 4; 7–9 в любом порядке после критичных.
