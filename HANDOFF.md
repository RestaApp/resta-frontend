# Resta — backend handoff

**Что нужно от бэкенда** для активации фич, которые уже подготовлены на фронте.
UI/engineering — [`AI_DEVELOPMENT_GUIDELINES.md`](AI_DEVELOPMENT_GUIDELINES.md). Канон проекта — [`.cursorrules`](.cursorrules).

---

## Иерархия документов и приоритет

| # | Источник | Зона ответственности |
|---|----------|----------------------|
| 1 | Задача пользователя (чат / PR) | — |
| 2 | **`.cursorrules`** | Стек, структура, Redux, TypeScript, общие принципы |
| 3a | **`AI_DEVELOPMENT_GUIDELINES.md`** | Design system, UI-примитивы, hooks, forms, a11y, verification |
| 3b | **`HANDOFF.md`** (этот файл) | Эндпоинты и контракты для интеграции с бэкендом |
| 4 | Паттерны целевых файлов | Локальные соглашения модуля |

**При расхождении между документами:** `.cursorrules` > специализированный документ **в его зоне** > код. Между `AI_DEVELOPMENT_GUIDELINES.md` и `HANDOFF.md` конфликта нет — разные зоны.

**Если фактический API расходится с этим файлом** — сначала обновить `HANDOFF.md`, потом фронт. Не подгонять типы и endpoints под «как сейчас на бэке» без фиксации контракта здесь.

---

## Готовые точки на фронте

| Фича | Компонент / место | Без бэка |
|------|-------------------|----------|
| PRO подписка (Stars) | [`telegram-stars-paywall.tsx`](src/components/ui/telegram-stars-paywall.tsx) | UI-only; `onPay` — заглушка |
| KPI профиля | [`ProfileKpiCard`](src/features/profile/ui/components/ProfileKpiCard.tsx), [`KpiRow`](src/components/ui/kpi-row.tsx) | `—` в рейтинге/заработке |
| Hire / контакты | заявки на смену | нет мутации `hire` |
| SOS / Boost на смене | [`ShiftCard`](src/components/ui/shift-card/ShiftCard.tsx), лента | только `urgent` (SOS) |
| AI-match | список кандидатов R04 | бейдж скрыт |

RTK Query: новые endpoints — `src/services/api/*Api.ts` + импорт в [`services/api/index.ts`](src/services/api/index.ts).

---

## 1. Telegram Stars — подписки PRO

Фронт **не создаёт invoice сам**. Бэк вызывает Bot API `createInvoiceLink` (валюта `XTR`), возвращает URL; фронт открывает `Telegram.WebApp.openInvoice(url, callback)`.

```
POST /api/v1/billing/stars/invoice
  body:    { plan_id: 'pro_monthly' | 'pro_yearly', role: 'venue' | 'supplier' }
  returns: { invoice_url: string, payload: string, stars: number, fiat_hint: string }

POST /api/v1/billing/stars/webhook
  body:    { telegram_payment_charge_id, payload, total_amount }
  effect:  активирует подписку, сохраняет ends_at

GET  /api/v1/billing/subscription
  returns: { active: boolean, plan: 'pro_monthly'|'pro_yearly'|null,
             ends_at: ISOString|null, in_trial: boolean }

POST /api/v1/billing/subscription/cancel
```

**Интеграция на фронте:** создать `billingApi.ts`, тег `'Subscription'`, подключить в `TelegramStarsPaywall` (`onPay` → POST invoice → openInvoice).

---

## 2. Hire — открытие контактов (R06)

```
POST /api/v1/applications/:id/hire
  effect:  статус 'hired', контакты доступны обеим сторонам
  returns: { contact: { telegram_username: string|null, phone: string|null } }
```

**Интеграция:** мутация `hireApplication` в applications API. Убедиться, что `telegram_username` отдаётся владельцу смены в карточке кандидата.

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

## 4. SOS / Boost на смене

Сейчас в UI: `urgent` → SOS-бейдж и сортировка.

Нужно от API:

| Поле | Назначение |
|------|------------|
| `is_sos: boolean` | экстренная смена <3ч, приоритет в ленте |
| `is_boosted: boolean` | бейдж BOOST |
| `boost_position?: number` | `BOOSTED · #2` (R03) |

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
