# I. Production readiness

## P0 — блокеры инфраструктуры

### Утечка живого ключа и реальных initData в `.env`
`/Users/Inessa/Downloads/Resta/.env`:
- строка 11 — **живой `ANTHROPIC_API_KEY=sk-ant-…`** (которому в frontend-проекте не место).
- строки 4/6/8 — реальные Telegram `initData` с валидными `signature`/`hash` для трёх реальных пользователей (ID 169315866, 6331161248, 5011057155).

Митигировано: `.env` в `.gitignore` и **не** git-tracked (`git ls-files .env` пуст) → утечка пока «на диске», не в remote.
→ **Немедленно ротировать `ANTHROPIC_API_KEY`** (считать скомпрометированным), удалить из FE, заменить initData синтетикой. Проверить, что ключ не попадал ни в одну ветку.

## P1

| Проблема | Файл | Фикс |
|---|---|---|
| `config.require_master_key` закомментирован → prod может стартовать без master-key | `config/environments/production.rb:18` | раскомментировать |
| `config.hosts` / host authorization выключены → DNS-rebinding | `production.rb:75-80` | задать prod-домены |
| `db:migrate` в build-шаге → риск на multi-instance/zero-downtime | `render.yaml:6`, `DEPLOYMENT.md:11` | вынести в `preDeployCommand` |
| JWT без ротации/отзыва, фикс. TTL 24ч; «refresh» лишь перевыпускает токен | `jwt_token_service.rb`, `auth_controller.rb:29-37` | jti-денилист / короткий access + refresh |
| Нет `.env.example` для FE; `VITE_APP_VERSION` читается, но не задан → `x-client-version`=`1.0.0` | `rtkQuery.ts:43` | добавить `.env.example`, прокинуть версию из git SHA |
| FE без error-tracking — `logger.error` no-op в prod | `shared/utils/logger.ts` | Sentry browser SDK |

## P2

| Проблема | Файл |
|---|---|
| CORS `credentials:true` + localhost-regex + хардкод prod-origin | `config/initializers/cors.rb:8-24` |
| rack-attack только по IP, нет throttle на checkout/refresh | `config/initializers/rack_attack.rb` |
| Render health-check указывает на `rails/health` (не проверяет БД/Redis), хотя есть глубокий `/api/v1/health`; в `DEPLOYMENT.md:196` URL без `/api/v1` | `routes.rb:7`, `health_controller.rb` |
| Два конфликтующих deploy-спека (`render.yaml` vs `DEPLOYMENT.md`) | — |
| Dockerfile на Ruby 3.1 при стандарте 3.3.5, `rails server` вместо Puma-конфига (вероятно stale) | `Dockerfile:1` |
| Placeholder-цены монетизации (vacancy 50/replacement 30/urgent 100/PRO 750 Stars) | `PRE_RELEASE_CHECKLIST.md:9-16` |
| CI FE не гейтит `format:check`/`knip`; backend CI на Node 18 (EOL); `bundle audit --update` — недетерминированный гейт | `.github/workflows/ci.yml` |
| lograge логирует `user_id`+`ip` в plaintext (privacy) | `config/initializers/lograge.rb:8-21` |
| webhook глотает все ошибки как 200 OK — убедиться, что внутренний сбой уходит в Sentry, не только в `Rails.logger` | `telegram/webhooks_controller.rb` |
| `ApplicationJob` retry/discard-дефолты закомментированы; часть cron-джоб без retry | `app/jobs/application_job.rb:5-12` |

## Положительное

`force_ssl=true`; webhook secret через `secure_compare` (fail-closed); Sentry `send_default_pii=false` + фильтрация `initData/hash/signature/token`; нет открытого `Sidekiq::Web`; `rescue_from`-лестница скрывает сырые AR-ошибки и пишет в `ErrorNotifier`/Sentry; `MOCK_INIT_DATA` гейтится `import.meta.env.DEV` (вырезается из прод-бандла); FE API-слой устойчив (single-flight refresh, retry-cap, `authSessionExpired`); идемпотентность платежей; выделенные очереди `payments/urgent_notifications/analytics`; backend CI содержит реальные гейты (RSpec + RuboCop + Brakeman + bundle-audit).
