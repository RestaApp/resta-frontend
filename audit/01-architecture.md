# A. Общая оценка архитектуры

## Сильные стороны (подтверждены)

- Чистая направленность зависимостей `features → shared → components/ui`; `components/ui` нигде не импортирует из `features`. Один `createApi`, один store, нет `any`, нет `@ts-ignore`, нет `console.*` вне логгера, нет `manualChunks`. Канон из `.cursorrules` соблюдается почти идеально.
- Backend по слоям корректен: тонкие контроллеры, бизнес-логика в service-объектах (`ServiceResult`), Pundit-политики, Blueprinter-сериализаторы, транзакции живут внутри сервисов. Денежные потоки (оплата/слоты/возврат) идемпотентны (unique `telegram_payment_id`), обёрнуты в транзакции с `lock!` — обхода со стороны клиента не найдено.
- Платёжная инвариантность: `PreCheckoutService` повторно валидирует план/цену/плательщика; consume-slot внутри транзакции откатывает смену при отсутствии слота.

## Архитектурные слабости

1. **Связанность `features/profile → features/monetization`** в обход правила «cross-feature только через navigation»:
   - `src/features/profile/ui/ProfilePage.tsx:8-9` — импорт `SubscriptionCard`, `SupplierAnalyticsCard`.
   - `src/features/profile/ui/components/edit-profile/EditProfileStepSupplierInfo.tsx:15-16` — импорт `useSupplierSubscription`, `UpgradeProDrawer`.

   Это недокументированная связь — либо вынести монетизационные поверхности в `shared/`, либо явно объявить `monetization` публичной фичей в каноне.

2. **Дублирование фильтрации на backend**: `app/services/shift_filter_service.rb` и `app/queries/shifts_query.rb` почти идентичны (`filter_by_*`, `normalize_list`) — нарушение DRY-канона.

3. **Telegram-слой как исключение из «тонких контроллеров»**: `app/services/telegram/update_router.rb` (316 LOC) + `update_router_helpers.rb` держат оркестрацию и бизнес-логику тикетов (переходы статусов) — и именно здесь живёт самая опасная дыра авторизации (см. [03-backend-issues.md](03-backend-issues.md) C2).

## Метрики

- Frontend: 448 TS/TSX файлов, 23 тест-файла (123 теста), knip — 0 мёртвых файлов/зависимостей.
- Backend: ~70 service-объектов, 14 контроллеров, 22 модели, 9 политик, 22 джобы, 72 миграции, 137 спеков.
