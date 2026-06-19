# Resta — backend handoff

**Что нужно от бэкенда** для активации фич, которые уже подготовлены на фронте.
UI/engineering — [`AI_DEVELOPMENT_GUIDELINES.md`](AI_DEVELOPMENT_GUIDELINES.md). Канон проекта — [`.cursorrules`](.cursorrules).

Иерархия документов и приоритет — см. [`.cursorrules`](.cursorrules).

**Если фактический API расходится с этим файлом** — сначала обновить `HANDOFF.md`, потом фронт. Не подгонять типы и endpoints под «как сейчас на бэке» без фиксации контракта здесь.

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

```
POST /api/v1/subscriptions/checkout
  body:    { plan_id: 'supplier_pro' | 'restaurant_pro', role: 'restaurant' | 'supplier' }
  returns: { invoice_url: string, payload: string, stars: number, fiat_hint: string }

GET  /api/v1/subscriptions/current
  returns: { active: boolean,
             plan: 'supplier_free' | 'supplier_pro' | 'restaurant_free' | 'restaurant_pro' | null,
             ends_at: ISOString|null, in_trial: boolean }

POST /api/v1/subscriptions/cancel
```

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

## 3. KPI профиля сотрудника (E10)

```
GET /api/v1/me/stats
  returns: {
    completed_shifts: number,        // частично есть на фронте
    earned_total_byn: number|null,   // агрегат pay по completed
    avg_rating: number|null,
    reviews_count: number|null
  }
```

Без полей UI показывает `—` — падения нет.

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

## 5. AI-match score (R04)

```
GET /api/v1/shifts/:id/applications?sort=ai_match
  каждое application: { ai_match_score: 0..100 }
```

UI: бейдж `AI · 94%`. Если поля нет — бейдж не рендерится.

---

## 6. Тема пользователя (опционально)

Сейчас тема только в `localStorage` ([`theme.ts`](src/utils/theme.ts)).

```
PATCH /api/v1/me { theme: 'dark' | 'light' }
```

Читать при старте сессии. `setTheme` — единая точка записи на фронте.

---

## После интеграции

```bash
npm run lint && npm run format:check && npm run build
```

Компоненты подключены через props/RTK Query — правки UI не требуются, если контракты совпадают с этим документом.

**Новые контракты** — дописывать сюда, не в чат и не в `.cursorrules`.
