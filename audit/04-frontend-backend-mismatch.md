# D. Frontend / backend mismatch

| # | Sev | Несоответствие | Frontend | Backend |
|---|---|---|---|---|
| D1 | P1 | `getMyShifts` не шлёт `per_page` → молчаливое усечение до 20; `completed_shifts` считается из этого списка → недосчёт | `shiftsApi.ts:213-217` | `shifts_controller.rb:99-112` |
| D2 | P1 | Supplier-аналитика: помесячный ключ `views`, FE ждёт `total_views` → в UI `undefined`/NaN | `analyticsApi.ts:33-39` | `supplier_stats_service.rb:80` |
| D3 | P1 | Shift create/update: FE шлёт `urgent`, strong-params его **дропают** (urgency только через `boost`) → ложное впечатление | `shiftsApi.types.ts:7-21` | `shifts_controller.rb:160-163` |
| D4 | P2 | invite-to-shift шлёт `user_id`, backend игнорирует (создаёт заявку от `current_user`). **НЕ P0 — гейт `STAFF_INVITE_ENABLED=false`** | `shiftsApi.ts:113-118`, `useEmployeeCatalogModel.ts:162` | `shift_applications_controller.rb:16-20` |
| D5 | P2 | `markNotificationRead`/`archive` типизированы `{success}`, backend возвращает полный ресурс (безвредно, тип неполный) | `notificationsApi.ts:99,131` | `notifications_controller.rb:40` |
| D6 | P2 | `reviewed_id` типизирован optional, но backend делает `params.require` → 422 если не передать; клиентский фильтр теперь избыточен | `reviewsApi.ts:44`, `ProfileReviewsList.tsx:65,70` | `reviews_controller.rb:11-14` |
| D7 | P2 | `GET /users` фильтры (`user_type` per-position, `min_experience`, `supplier_types`) — проверить, что `Users::ListEntrypoint` реально их применяет | `usersApi.ts:121-153` | `users_controller.rb:60-64` |
| D8 | P2 | Auth: FE шлёт и `init_data`, и `initData`; backend требует `initData`. Дубль и комментарий вводят в заблуждение | `authApi.ts:131` | `auth_controller.rb:42` |

## Мёртвый backend-surface (не вызывается фронтом)

- `GET /users/available_employees` (`routes.rb:23`) — **к тому же сломан**, см. C6.
- `GET /users/:id/profile` (`routes.rb:27`) — FE использует `GET /users/:id`.
- `GET /shifts/urgent` (`routes.rb:50`) — FE берёт срочные через `GET /shifts?urgent=true`.
- `GET /reviews/:id`, `PATCH/DELETE /reviews/:id` — FE использует только index+create.
- `GET /notifications/:id` (show) — FE использует только список.
- `GET /health`, `POST /cache/clear` — ops/admin, ожидаемо без FE-вызова.

## Рассинхрон документации

- `API.md` документирует несуществующий `POST /shifts/:id/apply` (реальный роут — `POST /shift_applications`) и фантомные `shift_start_time/shift_end_time` в ответе `received` (блюпринт их не отдаёт, FE их не ждёт).
- `HANDOFF.md` TODO #1 (5 тумблеров prefs) и TODO #2 (фильтр `reviewed_id`) **уже реализованы** на backend — дока и FE-комментарии устарели.

## Положительное

Кросс-кейсинг (snake_case) согласован на обеих сторонах — багов camel/snake не найдено. Из 42 фронтовых эндпоинтов ~33 совпадают полностью, остальные — перечисленные выше расхождения.
