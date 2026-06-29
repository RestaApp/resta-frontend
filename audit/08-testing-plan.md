# H. Testing plan

Текущее состояние сильное (FE 123 теста / 23 файла, BE 137 спеков), но есть критичные дыры в security-чувствительных зонах.

## Карта покрытия

### Frontend
| Зона | Покрыто | Дыры |
|---|---|---|
| Pure utils | `cn`, `number`, `workHistory`, `apiErrors` | `roles`, `roleMappers`, `buildRegistrationRequest`, `filters`, `datetime` |
| Shifts mapping | сильно (`mapping`, `normalizeShiftsResponse`, `applicationStatus`) | — |
| Auth / 401 refresh | только `applyAuthRefreshPayload` | **весь `shared/api/rtkQuery.ts` (reauth mutex, retry, logout)** |
| RTK Query cache | `shiftsApi.types`, `helpers` | optimistic updates (`notificationsApi`, `usersApi`), invalidation |
| Form / multi-step | только `addShiftValidation` | `useEditProfileFormController`, `add-shift/drawer/validation`, `useAddShiftFormSubmission` (402) |
| View-model builders | только `analyticsKpis` | остальной `buildProfileViewModel` (518 LOC), venue mappers |
| Monetization | `parsePaymentRequired`, `waitWithBackoff` | `PurchaseFlowProvider` (реактивный 402), `monetization.ts` gating |
| Visual (Playwright) | `tests/visual/smoke.spec.ts` | только boot/DEV-fallback экран в 2 темах |

### Backend
| Слой | Спеков | Дыры |
|---|---|---|
| Policies (9) | 7 | **`analytics_policy`, `support_ticket_policy` — нет спеков** |
| Services (~70) | ~57 | `payment_type_resolver`, `shift_query_service`, telegram-handlers |
| Controllers (14) | mixed | `cache_controller` — 0; concerns `contract_concern`, `shift_creation_helpers` |
| Requests | 8 | `shifts#boost`, `accept/reject`, collection-routes — только controller-specs |
| Concurrency | — | **нет race / rollback / N+1 (Bullet) тестов** |

Примечание: idempotency платежей **покрыта** (`process_payment_service_spec` и др.); webhook secret и `telegram_auth_validator` HMAC — тоже. Дыры — race-conditions, авторизация, admin cache.

## P0 — добавить немедленно

| Сценарий | Целевой файл |
|---|---|
| Reauth-слой: single-flight на параллельных 401, logout+`authSessionExpired` при провале, `shouldRetry` (скип `profile_incomplete`, только 408/429/5xx, cap) | `src/shared/api/rtkQuery.test.ts` (новый) |
| `analytics_policy` — supplier-only доступ | `spec/policies/analytics_policy_spec.rb` (новый) |
| `support_ticket_policy` — owner vs non-owner | `spec/policies/support_ticket_policy_spec.rb` (новый) |
| consume-slot под конкуренцией / откат под `lock!` | расширить `spec/services/monetization/consume_slot_service_spec.rb` |
| `cache#clear` admin-гейт + поведение | `spec/requests/api/v1/cache_spec.rb` (новый) |

## P1 — денежные и data-integrity потоки

- 402-retry flow → `src/shared/ui/add-shift/model/useAddShiftFormSubmission.test.ts`
- `PurchaseFlowProvider` single-flight/branching → `src/features/monetization/ui/PurchaseFlowProvider.test.tsx`
- edit-profile валидация/шаги → `useEditProfileFormController.test.ts`
- add-shift drawer валидация → `src/shared/ui/add-shift/drawer/validation.test.ts`
- notifications optimistic dual-cache + rollback → `src/services/api/notificationsApi.test.ts`
- `PATCH /shifts/:id/boost` → 402 без слота → `spec/requests/api/v1/shifts_boost_spec.rb`
- rollback `process_payment_service` (`lock!`+transaction)

## P2

`buildProfileViewModel` builders, role/registration mappers, venue mappers, Bullet/N+1-guard на списках, расширить Playwright за пределы boot-экрана (mock Telegram WebApp + seeded RTK store).

## Рекомендуемая структура

- **FE:** сохранить колокацию `*.test.ts`; тестировать чистые функции/хуки (`renderHook`); `onQueryStarted` и `baseQueryWithReauth` против mock-store с mocked `fetch`/`authService` (без сети) — наибольший рычаг.
- **BE:** каждая политика обязана иметь спек; общий helper для конкурентных `lock!`/transaction тестов; request-specs для всех монетизированных/авторизационных роутов; Bullet на списках.
- **Тестируемость:** код хорошо структурирован (чистые функции, service-объекты, политики). Трение — размер god-hooks (`useEditProfileFormController` 295, `buildProfileViewModel` 518): экспортировать чистые под-функции для изоляции.
