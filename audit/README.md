# Технический аудит проекта Resta (Telegram Mini App)

**Дата:** 2026-06-29 · **Объём:** frontend (Vite 7 / React 19 / TS strict / RTK Query — 448 файлов, 123 теста) + backend (Rails 7.2 API, JWT+Telegram, Pundit, Blueprinter, Sidekiq — ~70 сервисов, 72 миграции, 137 спеков).

**Метод:** статический анализ кода (Ruby локально не запускается), 6 параллельных глубоких прогонов + ручная верификация всех P0.

**Проверочные гейты:** `npm run lint` ✅ · `tsc -b` ✅ · `vitest` 123/123 ✅ · `knip` ✅ — все проходят.

---

## Вердикт

Зрелый, аккуратно структурированный проект. Ядро (биржа смен, профили, онбординг, поддержка, вся монетизация на Telegram Stars) реализовано полноценно. К продакшену **не готов** из-за небольшого, но критичного набора проблем безопасности/приватности и нескольких «выглядит готовым, но не работает» фич. Это точечные, локализованные исправления, а не системный долг.

---

## Содержание

| Файл | Раздел |
|---|---|
| [01-architecture.md](01-architecture.md) | A. Общая оценка архитектуры |
| [02-frontend-issues.md](02-frontend-issues.md) | B. Frontend issues |
| [03-backend-issues.md](03-backend-issues.md) | C. Backend issues (включая безопасность и БД) |
| [04-frontend-backend-mismatch.md](04-frontend-backend-mismatch.md) | D. Frontend / backend mismatch |
| [05-missing-features.md](05-missing-features.md) | E. Missing or incomplete features |
| [06-refactoring-plan.md](06-refactoring-plan.md) | F. Refactoring plan |
| [07-optimization-plan.md](07-optimization-plan.md) | G. Optimization plan |
| [08-testing-plan.md](08-testing-plan.md) | H. Testing plan |
| [09-production-readiness.md](09-production-readiness.md) | I. Production readiness |
| [10-priority-roadmap.md](10-priority-roadmap.md) | J. Priority roadmap (P0/P1/P2) |

---

## Краткая сводка приоритетов

### P0 — критично, до релиза (блокеры)
1. Ротировать `ANTHROPIC_API_KEY`, вычистить `.env` от ключа и реальных initData.
2. Контакты `phone/email/telegram_id` из default-view `UserBlueprint` + гейт доступа.
3. Авторизация Telegram-действий с тикетами.
4. Review update: mass-assignment + eligibility/can_edit.
5. Отклонять JWT неактивных пользователей.
6. Admin-гейт `cache#clear` ≠ `role=='restaurant'` + закрыть самоэскалацию роли.
7. Передача контактов при `accept`.

### P1 — важно до/сразу после запуска
initData `secure_compare`+`auth_date`; unique-индексы; CHECK на деньги/рейтинг; N+1 в shifts; in-app уведомления; модерация отзывов; контрактные правки (per_page, total_views→views, urgent); FE error-tracking; конфиг production (master_key, hosts, migrate); тесты P0.

### P2 — после запуска / тех-долг
Архитектурная гигиена (monetization→shared, дедуп фильтрации, god-hooks); серверный фильтр shifts?user_id; уборка мёртвого кода; CORS/rate-limit hardening; CI gates; расширение тестов.

Полный roadmap — в [10-priority-roadmap.md](10-priority-roadmap.md).
