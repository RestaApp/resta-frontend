# J. Priority roadmap

Ссылки на детали: [02-frontend-issues](02-frontend-issues.md) (B), [03-backend-issues](03-backend-issues.md) (C), [04-mismatch](04-frontend-backend-mismatch.md) (D), [05-features](05-missing-features.md) (E), [09-production-readiness](09-production-readiness.md) (I).

## P0 — критично, исправить сразу (блокеры релиза)

1. Ротировать `ANTHROPIC_API_KEY`, вычистить `.env` от ключа и реальных initData — *I*.
2. Контакты `phone/email/telegram_id` из default-view `UserBlueprint` + гейт доступа — *C1 / E*.
3. Авторизация Telegram-действий с тикетами — *C2*.
4. Review update: убрать mass-assignment, форсить eligibility/`can_edit?` — *C3*.
5. Отклонять JWT неактивных пользователей — *C4*.
6. Admin-гейт `cache#clear` ≠ `role=='restaurant'` + закрыть самоэскалацию роли — *C5*.
7. Передача контактов при `accept` — *E*.

## P1 — важно до/сразу после запуска

**Безопасность/БД:** initData `secure_compare`+`auth_date` (*C7*); unique-индексы username и (user_id,shift_id) (*C8/C9*); CHECK на деньги/рейтинг (*C11*); вынести trial из транзакции (*C12*); N+1 в my/applied_shifts (*C10*).

**Фичи:** in-app `Notification`-записи для всех типов (*E*); авто-архивация `review_reminder` при создании отзыва — бэк (*C14*) + FE-инвалидация (*B10*); детерминизм `application_for` (*E*); модерация отзывов или явное снятие статусов (*E*).

**Контракт:** `per_page` в my_shifts; `total_views→views`; убрать `urgent` из create (*D1–D3*).

**Frontend:** error-tracking Sentry (*B3*); `isError` в staff-applications (*B1*); guard на каст suppliers (*B2*).

**Инфра:** `require_master_key`+`config.hosts`; migrate из build-шага; JWT-ротация/TTL (*I*).

**Тесты:** reauth-слой, `analytics_policy`/`support_ticket_policy`, consume-slot concurrency, cache request-spec (*H P0*).

## P2 — после запуска / тех-долг

**Архитектура:** monetization → `shared/` (*A1*); дедуп фильтрации shifts (*A2*); разбить god-hooks/крупные файлы (*B4/B5*).

**Производительность:** серверный фильтр `shifts?user_id=` (*G*).

**Уборка:** удалить мёртвый backend-surface и invite-код (*C6/D4/D7*); barrel/opacity (*B6/B7*); синхронизировать `API.md`/`HANDOFF.md` (*D8*).

**Инфра:** CORS/rate-limit hardening; health-check path; единый deploy-спек; CI gates (`format:check`/`knip`, Node-версии); финальные цены монетизации (*I*).

**Тесты:** view-model builders, mappers, Bullet-guard, Playwright за пределы boot-экрана (*H P2*).

---

## Сводка по количеству находок

| Приоритет | Кол-во | Зоны |
|---|---|---|
| P0 | 7 | секреты, приватность контактов, авторизация тикетов, review-update, сессии, admin-гейт, accept-контакты |
| P1 | ~19 | initData, БД-инварианты, N+1, in-app уведомления, авто-закрытие review_reminder, модерация, контракт, FE error-handling, инфра-конфиг, тесты |
| P2 | ~20 | архитектурная гигиена, мёртвый код, hardening, CI, расширение тестов |

**Итог:** архитектурно проект здоровый и хорошо тестируемый; код-канон соблюдается. Реальные блокеры релиза — узкая группа проблем приватности/авторизации и утечка ключа в локальном `.env`, плюс две «полупустые» фичи (in-app уведомления, модерация отзывов).
