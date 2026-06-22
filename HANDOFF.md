# Resta — backend handoff

**Что нужно от бэкенда** для активации фич, которые уже подготовлены на фронте.
UI/engineering — [`AI_DEVELOPMENT_GUIDELINES.md`](AI_DEVELOPMENT_GUIDELINES.md). Канон проекта — [`.cursorrules`](.cursorrules).

Иерархия документов и приоритет — см. [`.cursorrules`](.cursorrules).

**Если фактический API расходится с этим файлом** — сначала обновить `HANDOFF.md`, потом фронт. Не подгонять типы и endpoints под «как сейчас на бэке» без фиксации контракта здесь.

---

## ⚡ Что нужно от бэкенда (TODO)

> Проверено против кода `resta_backend` на ветке `main` (22.06.2026). Ниже — **только то, что реально надо доделать**. Остальные разделы файла — справка по уже работающим контрактам.

### 🔴 Блокирует фичи (фронт готов, ждёт бэк)

**1. Отдавать 2 поля в настройках уведомлений**

Файл: `app/controllers/api/v1/notification_preferences_controller.rb`.
Колонки `vacancy_notifications` и `replacement_notifications` уже есть в БД (`default true NOT NULL`), но контроллер их не принимает и не возвращает. Нужно:

- в `notification_preference_params` (permit) добавить `:vacancy_notifications`, `:replacement_notifications`;
- в `notification_preference_data` (тело ответа) добавить эти же два поля.

После фикса `GET/PATCH /api/v1/notification_preferences` отдаёт 5 полей:

```json
{ "urgent_notifications": true, "new_shifts_notifications": true,
  "vacancy_notifications": true, "replacement_notifications": true,
  "application_notifications": true, "all_enabled": true, "all_disabled": false }
```

Фронт уже готов — два тумблера появятся сами, отдельной выкатки фронта не нужно.

**2. Фильтр отзывов по пользователю**

Файл: `app/controllers/api/v1/reviews_controller.rb`, экшен `index`.
Сейчас `GET /api/v1/reviews` возвращает **все** отзывы (`Review.kept`) — без фильтра и без `policy_scope`. Нужно принять query-параметр `reviewed_id` и вернуть отзывы только этого пользователя + пагинация (Kaminari, как в других коллекциях):

```
GET /api/v1/reviews?reviewed_id=42&page=1&per_page=20
→ только отзывы, где reviewed_id = 42
```

Поля ответа менять не надо — текущий `ReviewBlueprint` подходит. До фикса фронт грузит всю таблицу и фильтрует по `reviewed.id` на клиенте (временный костыль).

**3. Фильтр смен по заведению (для экрана «Все вакансии заведения»)**

Файл: `app/controllers/api/v1/shifts_controller.rb` (`filter_params`) + `app/queries/shifts_query.rb`.
Сейчас `GET /api/v1/shifts` не умеет фильтровать по владельцу — `filter_params` не пермитит `user_id`, в `ShiftsQuery` нет `filter_by_user`. Нужно принять `user_id` и вернуть открытые вакансии этого заведения:

```
GET /api/v1/shifts?user_id=42&shift_type=vacancy
→ только открытые смены/вакансии, где shift.user_id = 42
```

Фронт уже готов (кнопка «Все вакансии и смены» на профиле заведения, `VenueListingsDrawer`): шлёт `user_id` и временно дофильтровывает по `ownerId` на клиенте (грузит ленту целиком — неэффективно).

**4. Детерминизм `application_for` (рассинхрон статуса заявки)**

Файл: `app/models/concerns/shift_applications_logic.rb`, метод `application_for`.
Сейчас `shift_applications.find { pending? || accepted? || rejected? }` берёт **первую попавшуюся** заявку пользователя по смене. Если заявок несколько (отклонили → откликнулся снова), лента (`GET /shifts` → `my_application`) и «Заявки» (`applied_shifts`) показывают **разные** статусы одной смены (баг: лента «В обработке», заявки «Отклонено»). Нужно возвращать одну детерминированную заявку (например, самую свежую по `created_at`/`id`) — одинаково во всех эндпоинтах.

### 🟡 Желательно (не блокирует — фронт деградирует штатно)

| # | Что добавить | Сейчас | Зачем |
| - | ------------ | ------ | ----- |
| 3 | `completed_shifts` в `UserBlueprint` (`GET /users/:id`) | поля нет, фронт считает сам из `my_shifts` | KPI «Смен» станет точным (вся история, а не только активные смены) |
| 4 | `earned_total_byn` (сумма оплат по `completed`) | поля нет | KPI «Заработок» сотрудника; сейчас `—` |
| 5 | `ai_match_score` в заявках (R04) | фичи нет | бейдж `AI · NN%` в списке кандидатов; сейчас скрыт |
| 6 | `PATCH /api/v1/me { theme }` | хранения нет | синхронизация темы между устройствами; сейчас только `localStorage` |
| 7 | In-app `Notification`-записи (`GET /notifications`, `/has_unread`) | колокол/список пустые | фронт **корректно** полит `has_unread` (30с) и грузит список — если уведомлений нет, бэк не создаёт in-app записи (шлёт только в Telegram-бот). По контракту «In-App создаются всегда» — проверить, что записи реально пишутся |

### ✅ Уже готово — не трогать

Контракты работают, фронт на них завязан:
`/analytics/track`, `/analytics/my`, `/analytics/supplier`, `/subscriptions/{checkout,current}`, `/purchases` (+`/checkout`), `PATCH /shifts/:id/boost`, accept/reject заявок, `notification_preferences` (3 текущих поля).

---

## Терминология

| Контекст | Канон | Не использовать в контрактах |
| -------- | ----- | ---------------------------- |
| Роль аккаунта (API) | `employee` · `restaurant` · `supplier` · `unverified` | `venue` |
| Срочная смена | `urgent: boolean` | `is_sos` |
| Продвижение в ленте | `boosted: boolean`, `boost_position?: number` | `is_boosted` |
| Принятие кандидата | `application.status = 'accepted'`, `shift.status = 'filled'` | `hired` |

На фронте `venue` — только внутренний UI‑alias навигации (`UiRole`), в API и `HANDOFF` — всегда `restaurant`.

---

## Готовые точки на фронте

| Фича                    | Компонент / место                                                                                                      | Без бэка                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| PRO подписка (Stars)    | paywall / Stars CTA ([`button.tsx`](src/components/ui/button.tsx) variant `stars`)                                     | UI-only; оплата — заглушка       |
| KPI профиля             | [`ProfileOverview`](src/shared/ui/user-profile/components/ProfileOverview.tsx), [`KpiRow`](src/components/ui/kpi-row.tsx) | `—` в рейтинге/заработке         |
| Accept / Reject заявок  | [`shiftsApi.ts`](src/services/api/shiftsApi.ts) — `acceptApplication` / `rejectApplication`                            | эндпоинты уже вызываются         |
| Urgent / Boost на смене | [`ShiftCard`](src/components/ui/shift-card/ShiftCard.tsx), лента                                                       | только `urgent`; boost — заглушка |
| AI-match                | список кандидатов R04                                                                                                  | бейдж скрыт                      |

RTK Query: новые endpoints — `src/services/api/*Api.ts` + импорт в [`services/api/index.ts`](src/services/api/index.ts).

---

## 1. Telegram Stars — подписки PRO

Фронт **не создаёт invoice сам**. Бэк вызывает Bot API `createInvoiceLink` (валюта `XTR`), возвращает URL; фронт открывает `Telegram.WebApp.openInvoice(url, callback)`.

**Фактический контракт (см. `resta_backend/API.md` и `Frontend/SUBSCRIPTIONS_API_SPEC.md`):**

```
POST /api/v1/subscriptions/checkout            # только supplier
  body:    { plan_name: 'supplier_pro' }
  returns: { success, data: { invoice_url: string } }

GET  /api/v1/subscriptions/current
  returns: { success, data: {
             subscription: { id, status, purchased_at, expires_at, days_remaining } | null,
             plan: { id, name, role, subscription_price, duration_days, features, limits },
             usage: { <resource>: { used, limit, remaining } } | null   # null при Flipper ON
           } }
```

> ⚠️ Старый контракт (`plan_id` + `role`, `current → { active, plan, ends_at, in_trial }`, `POST /subscriptions/cancel`) **устарел** — на бэкенде его нет. Фронт (`subscriptionsApi.ts`) уже использует актуальный. Отмены подписки через API нет (рефанд — внутренний webhook Telegram).

**Тарифы (продуктовый канон):**

| plan_id         | Роль        | Цена              |
| --------------- | ----------- | ----------------- |
| `supplier_free` | `supplier`  | бесплатно         |
| `supplier_pro`  | `supplier`  | 750 Stars / месяц |
| `restaurant_pro`| `restaurant`| TBD               |

Годовой тариф (`pro_yearly`) **не в продукте** — не добавлять в контракт, пока не утверждён.

Webhook оплаты (`telegram_payment_charge_id`) — **внутренний бэкенд**, фронт не вызывает.

**Интеграция на фронте:** создать `subscriptionsApi.ts`, добавить тег `'Subscription'` в `tagTypes`, подключить paywall (`onPay` → POST checkout → openInvoice).

---

## 2. Accept / Reject заявок — открытие контактов (R06)

Статусы заявки: `pending` · `accepted` · `rejected`.
Статусы смены: `open` · `filled` · `completed` · `cancelled`.

```
POST /api/v1/shift_applications/:id/accept
  effect:  application.status = 'accepted',
           shift.status = 'filled',
           shift.selected_applicant_id = user_id,
           контакты доступны обеим сторонам
  returns: { contact: { telegram_username: string|null, phone: string|null } }

POST /api/v1/shift_applications/:id/reject
  effect:  application.status = 'rejected'
```

**Интеграция:** мутации `acceptApplication` / `rejectApplication` уже в [`shiftsApi.ts`](src/services/api/shiftsApi.ts). Убедиться, что `telegram_username` отдаётся владельцу смены в карточке кандидата.

Не использовать статус `hired` и endpoint `/applications/:id/hire`.

---

## 3. KPI профиля (E10) — ✅ реализовано

Эндпоинта `/me/stats` на бэкенде **нет**. Фактические источники KPI:

- `avg_rating`, `reviews_count` — агрегаты `average_rating`, `total_reviews` в `UserBlueprint` (`GET /api/v1/users/:id`). ✅ есть.
- `completed_shifts` — поля в API **нет**; фронт считает сам из `my_shifts` (`useProfilePageModel`). Точный серверный счётчик — TODO #3.
- Просмотры профиля и клики по контактам за месяц — `GET /api/v1/analytics/my` (`profile_views_count`, `profile_views_this_month`, `contact_clicks_this_month`). ✅ подключено в KPI **своего** профиля.

`earned_total_byn` (суммарный заработок) — TODO #4; без поля UI показывает `—`.

---

## 4. Urgent / Boost на смене

**`urgent`** — пометка срочной смены (SOS-бейдж, приоритет в ленте). По факту контракта (`resta_backend/API.md`) ставится через `PATCH /shifts/:id/boost`, выставляющий `urgent: true`. Доступно **владельцу открытой смены** — и ресторанам, и **сотрудникам** (employee urgent_boost, синхронизировано в коммите `dc20503`).

Поля смены в API:

| Поле                      | Назначение                              |
| ------------------------- | --------------------------------------- |
| `urgent: boolean`         | срочная смена, приоритет в ленте        |
| `boosted: boolean`        | бейдж BOOST (продвижение в ленте, R03)  |
| `boost_position?: number` | `BOOSTED · #2` (R03)                    |

```
PATCH /api/v1/shifts/:id/boost
  effect:  urgent = true, boosted_at записывается
  биллинг:  Flipper OFF — 1 бесплатный буст/мес (monthly_boosts),
            при исчерпании → 402 { purchase_type: "urgent_boost", price: 100 }
            Flipper ON — каждый буст требует покупку urgent_boost
  returns: обновлённая смена; либо 402 (см. поток покупки слотов)
```

**Бесплатный лимит бустов** (`monthly_boosts`, по умолчанию 1/мес) приходит в `usage` от `GET /subscriptions/current` наряду с `monthly_vacancies` / `monthly_replacements`. Фронт показывает остаток рядом с кнопкой буста (`monetization.usage.boosts`) и отрабатывает 402 общим потоком покупки слотов.

Не использовать `is_sos` / `is_boosted` — фронт уже работает с `urgent` / `boosted`.

### Монетизация поставщиков — страховка 422

`POST /subscriptions/checkout` при выключенном бэкенд-флаге `monetization_suppliers_enabled` возвращает **422** `{ errors: ["Subscription purchases are not available yet."] }`. Кнопку оплаты гейтит фронт-флаг `VITE_MONETIZATION`, синхронный с бэком; 422 — лишь страховка от рассинхрона флагов (обрабатывается в `useSubscriptionCheckout`, сообщение `monetization.pro.disabled`).

---

## 5. AI-match score (R04) — ⛔ на бэкенде нет

Контракта `?sort=ai_match` / `ai_match_score` в `API.md` нет, фичи на бэке пока нет. Бейдж `AI · 94%` на фронте скрыт (поле отсутствует) — рендерится только когда бэкенд начнёт отдавать `ai_match_score`. Не закладывать в типы как обязательное.

---

## 6. Тема пользователя — ⛔ на бэкенде нет

`PATCH /api/v1/me { theme }` в `API.md` отсутствует. Тема остаётся только в `localStorage` ([`theme.ts`](src/utils/theme.ts)). Если появится серверное хранение — читать при старте сессии, `setTheme` единая точка записи.

---

## 7. Аналитика — ✅ реализовано

- `POST /api/v1/analytics/track` — клики по контактам и запрос прайс-листа (`analyticsApi.trackEvent`, `UserProfileDrawer`).
- `GET /api/v1/analytics/my` — KPI просмотров/кликов своего профиля (см. §3).
- `GET /api/v1/analytics/supplier` — дашборд поставщика (`SupplierAnalyticsCard` на `ProfilePage`). Поля `plan` / `analytics_locked` (FREE/PRO-локап после мержа monetization) обработаны опционально.

## 8. Настройки уведомлений

`GET/PATCH /api/v1/notification_preferences`. Фронт готов к 5 тумблерам, но бэк сейчас отдаёт 3 (`urgent_notifications`, `new_shifts_notifications`, `application_notifications`). Два недостающих (`vacancy_notifications`, `replacement_notifications`) — **TODO #1** (колонки в БД уже есть). До фикса фронт показывает только те поля, что реально приходят в ответе.

## 9. Отзывы

Фронт реализовал ленту отзывов в профиле (`ProfileReviewsList`, `reviewsApi.getReviews`). Нужен фильтр `reviewed_id` в `GET /reviews` — **TODO #2**. До этого фронт дофильтровывает по `reviewed.id` на клиенте (грузит всю таблицу — неэффективно на объёме).

---

## После интеграции

```bash
npm run lint && npm run format:check && npm run build
```

Компоненты подключены через props/RTK Query — правки UI не требуются, если контракты совпадают с этим документом.

**Новые контракты** — дописывать сюда, не в чат и не в `.cursorrules`.
