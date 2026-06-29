# G. Optimization plan

## Делать (реальный эффект)

| Оптимизация | Где | Эффект |
|---|---|---|
| Eager-load `selected_applicant` | `queries/shifts_query.rb:51,67` (my_shifts/applied_shifts) | Убирает N+1: сейчас `ShiftBlueprint` (`shift_reviewable`) грузит applicant на каждый элемент списка |
| Углубить `includes` в reviews#index | `reviews_controller.rb:15-16` | Прегрузка вложенных профилей reviewer/reviewed, используемых блюпринтом |
| Серверный фильтр `shifts?user_id=` | `shifts_controller` + `shifts_query` (HANDOFF TODO#3) | «All venue listings» сейчас тянет весь фид и фильтрует на клиенте по `ownerId` — экономия трафика/памяти на крупных аккаунтах |
| Пагинация `getMyShifts` (`per_page`) | `shiftsApi.ts:213` | Устраняет усечение списка и неверный `completed_shifts` (D1) |

## Не делать сейчас (преждевременно)

- Дополнительная мемоизация на FE — большинство «missing memo» из прогона оказались ложными; виртуализация (`@tanstack/react-virtual`), single-flight refresh и retry-cap уже на месте.
- Тотальные CHECK/enum-констрейнты на все колонки — точечно только критичные (`role`, `purchase_type`, `status`, `rating`, деньги), см. C11.
- Агрессивный кэш сверх существующего `CachedDataService`.

## Backend-производительность: текущее состояние

Положительно: все FK проиндексированы, ORDER BY фиксированный, фильтры параметризованы, Kaminari-пагинация консистентна, idempotency-индексы на платежах. Узких мест помимо N+1 в shift-списках не обнаружено.
