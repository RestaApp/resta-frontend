# Resta — handoff из дизайна Resta Wireframes.html

Документ ставит точку в редизайне UI и фиксирует, чего не хватает на бэке для
полноценной работы новых экранов. Логика приложения переписана под концепцию
**REDESIGN** из `Resta Audit.html` / `Resta Wireframes.html`:

- единый набор бейджей **SOS / VERIFIED / DIRECT / BOOST / PRO / ⭐ STARS**;
- оплаты за смены — **напрямую** между сотрудником и заведением (Resta комиссии не берёт, эскроу удалён);
- подписки PRO — **через Telegram Stars**, фиатный приём не используется;
- темы **dark** / **light** — переключаются на лету, выбор сохраняется.

## Что уже сделано во фронте

| Слой | Что изменено |
|------|--------------|
| Дизайн-токены | `src/index.css`: палитра приведена к спецификации (accent `#FF6B2C`, success `#3EC97E`, warning/Stars `#F5B142`, danger `#F24D4D`), surface‑шкала `--card`/`--surface-subtle`/`--drawer-surface` соответствует `--p-*`. Добавлена тема `[data-theme="light"]`. |
| Утилиты темы | `src/utils/theme.ts` — `getCurrentTheme` / `setTheme` / `toggleTheme` / `initTheme`. Тема пишется в `<html data-theme="…">` и в `localStorage`. |
| ThemeToggle | `src/components/ui/theme-toggle.tsx` — переключатель, добавлен в `ProfileSettings`. |
| Бейджи | `src/components/ui/badge.tsx` — варианты `sos`, `urgent`, `verified`, `direct`, `boost`, `pro`, `stars`, `pending`, `ok`, `rej` (один SRP — отрисовка). `escrow` помечен `@deprecated`, оставлен как алиас. |
| Direct Pay | `src/components/ui/StatusPill.tsx` — `DirectPayBadge` заменил `EscrowBadge`. Старое имя оставлено алиасом для совместимости. |
| KPI-блок | `src/components/ui/kpi-row.tsx` — общая сетка из чисел/подписей; используется в профиле сотрудника, можно подключать в R01/S03. |
| Telegram Stars Paywall | `src/components/ui/telegram-stars-paywall.tsx` — пресентейшн‑компонент для пейволла подписок. Принимает массив `plans`, `features`, `selectedPlanId`, коллбеки `onSelectPlan`/`onPay`. Любая бизнес‑логика — снаружи (см. ниже). |
| Profile | `ProfileKpiCard` — KPI‑карточка для employee (E10). Без бэка показывает `—` в полях рейтинга/заработка. |

Все изменения соответствуют SOLID:

- **SRP** — каждый новый компонент решает одну задачу: `ThemeToggle` переключает тему, `KpiRow` рисует строку KPI, `TelegramStarsPaywall` рендерит карточки тарифов.
- **OCP** — варианты бейджей расширяются записью в `BADGE_VARIANTS` без правок самого компонента.
- **LSP** — `EscrowBadge = DirectPayBadge` (унаследованные вызовы продолжают работать без изменений сигнатуры).
- **ISP** — `TelegramStarsPaywallProps` не требует ничего лишнего: только данные тарифов и колбэки. UI ничего не знает про API.
- **DIP** — оплата делегируется через проп `onPay`; компонент не зависит от реализации Stars‑шлюза.

## Что нужно дописать на бэке

> Ниже — минимальный набор эндпоинтов, без которых редизайн работает в режиме
> «просмотр», но часть данных рендерится плейсхолдерами `—`.

### 1. Telegram Stars — подписки PRO

Парадигма: фронт **не открывает счёт сам**. Он зовёт бэк, бэк создаёт invoice
через Bot API `createInvoiceLink` (валюта `XTR`) и возвращает `invoice_url` /
`payload`, который фронт открывает через `Telegram.WebApp.openInvoice(invoice_url, callback)`.

```
POST /api/v1/billing/stars/invoice
  body:    { plan_id: 'pro_monthly' | 'pro_yearly', role: 'venue' | 'supplier' }
  returns: { invoice_url: string, payload: string, stars: number, fiat_hint: string }

POST /api/v1/billing/stars/webhook        // принимает Telegram payment_succeeded
  body:    { telegram_payment_charge_id, payload, total_amount }
  effect:  активирует подписку, сохраняет дату окончания

GET  /api/v1/billing/subscription
  returns: { active: boolean, plan: 'pro_monthly'|'pro_yearly'|null,
             ends_at: ISOString|null, in_trial: boolean }

POST /api/v1/billing/subscription/cancel  // отмена автопродления
```

Где будет вызываться: `TelegramStarsPaywall` (`onPay` → POST invoice → openInvoice).
Стартовая точка интеграции: `src/services/api/billingApi.ts` (создать новый файл,
зарегистрировать в `services/api/index.ts`, добавить тег `'Subscription'`).

### 2. Прямая связь с кандидатом (R06 «Открыть контакты»)

После найма ресторан получает контакты сотрудника и открывает чат напрямую.

```
POST /api/v1/applications/:id/hire
  effect:  переводит заявку в статус 'hired', открывает контакты обеим сторонам
  returns: { contact: { telegram_username: string|null, phone: string|null } }
```

Фронт уже умеет ходить за `applications` — нужно лишь добавить мутацию
`hireApplication`. Поле `telegram_username` уже частично присутствует
(см. `useUserProfile`), нужно убедиться, что оно отдаётся в карточке кандидата
для владельца смены.

### 3. KPI профиля сотрудника (E10)

`ProfileKpiCard` ожидает 3 показателя, бэк сейчас возвращает только смены:

```
GET /api/v1/me/stats
  returns: {
    completed_shifts: number,        // ✅ уже есть, считаем на фронте
    earned_total_byn: number|null,   // ❌ нужен агрегат «сумма pay по completed»
    avg_rating: number|null,         // ❌ нужен агрегат отзывов о сотруднике
    reviews_count: number|null
  }
```

Без них KPI‑карточка корректно рендерит «—» (см. `ProfileKpiCard`).

### 4. SOS / Boost / Direct‑флаги на смене

В UI карточек смен (`ShiftCard`, фильтры ленты) уже учтены поля `urgent` и
`escrow`. Под новый редизайн нужно дополнительно:

- **`is_sos: boolean`** — экстренная смена <3ч, отдельная сортировка вверх ленты;
- **`is_boosted: boolean`** + `boost_position?: number` — для бейджа `BOOSTED · #2` (R03);
- **`venue_verified: boolean`** — мигрирует с заведения, рендерится бейджем `VERIFIED` (E02/E04);
- удалить из API поле `escrow`/`escrow_amount`: больше не используется. На фронте оставлен алиас, но как только бэк выпилит — фронт уже совместим.

### 5. AI‑match score (R04)

Кандидаты в R04 показываются с бейджем `AI · 94%`. Нужно:

```
GET /api/v1/shifts/:id/applications?sort=ai_match
  каждое application: { ai_match_score: 0..100 }
```

Если эндпоинт не готов — фронт может скрывать бейдж (UI без полей не падает).

### 6. Тема пользователя (опц.)

Сейчас `theme` хранится только в `localStorage`. Если хочется синхронизировать
тему между устройствами — добавить `PATCH /api/v1/me { theme: 'dark'|'light' }`
и читать при старте сессии. На UI ничего менять не придётся: `setTheme` —
единая точка записи.

## Что осталось до полного покрытия 32 экранов

| Экран | Состояние |
|-------|-----------|
| O01 Loading | Базовый сплэш есть (`LoadingPage`) — можно адаптировать стиль (центрирование лого + спиннер) |
| O02 Role Select | Существует (`features/role-selector`) — токены применятся автоматически |
| O03 TG Auth | `TelegramConfirmStep` уже есть |
| O04 First Profile | `EmployeeSubRoleSelector` / `PositionSelectionScreen` — нужно проверить визуал |
| E02 Feed | Карточка `ShiftCard` использует токены, бейджи `direct`/`urgent` доступны |
| E04 Detail | `FeedDetails` нужно скормить `DirectPayBadge` вместо `EscrowBadge` (alias уже работает) |
| E05 Apply Modal | `ApplyCoverLetterModal` — токены применятся |
| E10 Profile | `ProfileKpiCard` подключён |
| R01 Dashboard | Можно дополнительно использовать `KpiRow` |
| R* Stars Paywall | Готовый `<TelegramStarsPaywall />` нужно вставить в страницу подписки и подключить `billingApi` (после того как бэк отдаст invoice) |
| S01–S04 | Только токены, контент уже совпадает |

## Как собрать

```
npm install
npm run lint
npm run build
```

После интеграции бэка (Stars + KPI + Hire) UI заводится без правок: компоненты
готовы к подключению через свои props‑контракты.
