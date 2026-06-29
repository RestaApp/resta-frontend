# B. Frontend issues

| # | Severity | Файл | Проблема | Рекомендация |
|---|---|---|---|---|
| B1 | P1 | `features/venue/ui/staff/useStaffApplicationsController.ts:37-41` | `isError` из query не читается → при ошибке рендерится пустой список без UI ошибки/ретрая | Прокинуть `isError`, показать `ErrorState` |
| B2 | P1 | `features/venue/ui/suppliers/useVenueSuppliersPageModel.ts:108-122` | Слепой каст `apiData as SupplierApiUser[] / RestaurantApiUser[]` по runtime-флагу, без валидации | Дискриминированный тип возврата или narrowing-guard |
| B3 | P1 | `shared/utils/logger.ts` | `logger.error` — **no-op в продакшене**; фронтового error-tracking нет вообще → продакшен-краши невидимы | Подключить Sentry browser SDK + React error boundary |
| B4 | P2 | `shared/ui/user-profile/buildProfileViewModel.ts` (518 LOC), `shared/ui/user-profile/components/ProfileOverview.tsx` (452 LOC) | Файлы выше порога обязательного сплита (§3.4) | Разбить по ролям/секциям |
| B5 | P2 | `useStaffApplicationsController.ts` (269), `features/profile/model/hooks/useProfilePageModel.ts` (254) | God-hooks: queries+mutations+selection+overlay в одном хуке | Выделить sub-hooks (data / ui-state / actions) |
| B6 | P2 | `components/BottomNav.tsx:55` `bg-background/95`; `features/notifications/ui/NotificationsDrawer.tsx:172` `/40`; `shared/ui/shift-details-screen/ApplicantPreviewCard.tsx:89,113` `/50` | opacity-токены вне allowlist §14.4 | Привести к `/92` и `/30`/`/70` |
| B7 | P2 | `shared/ui/add-shift/fields/index.ts` | Barrel с 0 потребителей | Удалить |
| B8 | P2 | `useProfilePageModel.ts:44-56` | Двойное чтение `localStorage` (lazy init + useEffect) | Свернуть в lazy-initializer |
| B9 | P2 | `useAddShiftDrawerController.ts:225,239`, `useEditProfileFormController.ts:231,236` | Каст арифметики к literal-union step (`as StepIndex`) — доверие к расчёту | `clamp`+lookup-хелпер, возвращающий union |
| ~~B10~~ ✅ | ~~P2~~ | ~~`services/api/reviewsApi.ts:83-102`~~ | ~~`createReview` инвалидирует только `Shift`/`User`; после оставленного отзыва напоминание `review_reminder` остаётся в инбоксе до следующего поллинга~~ **СДЕЛАНО** (ветка `feat/invalidate-notifications-on-review`) | ~~Добавить `'Notification'` в `invalidatesTags` `createReview`~~ Тег `'Notification'` добавлен + тест на рефетч |

## Положительное

- i18n паритет en/ru корректен (дельта — только русские plural-формы `_few`/`_many`).
- Нет TODO/FIXME/HACK, mock/stub/hardcode-данных в `src/`.
- Нет прямого доступа к `window.Telegram` (только через контексты/хуки).
- Type safety сильная: strict mode, 0 `any`, 0 `@ts-ignore`; 56 `as` — почти все легитимные boundary-narrowing.
- API-слой солидный: single-flight refresh на 401, retry только 408/429/5xx с cap, корректный скип `profile_incomplete`.
