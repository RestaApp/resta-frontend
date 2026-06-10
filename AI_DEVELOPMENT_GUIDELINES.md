# AI_DEVELOPMENT_GUIDELINES.md

Reference doc для UI и frontend engineering. Иерархия документов, стек, общие принципы — в [`.cursorrules`](.cursorrules) (этот файл его не дублирует).

§14 — **продолжение `.cursorrules`** (архитектурные правила).
§1–§13 — design system, UI‑примитивы, hooks, forms, a11y, verification.

---

## 0. Принципы

1. **Stability over novelty** — перед добавлением проверь, есть ли уже примитив/токен.
2. **Один источник истины:** цвета и радиусы — [`src/index.css`](src/index.css); className‑паттерны — [`ui-patterns.ts`](src/components/ui/ui-patterns.ts); z‑index — [`zIndex.ts`](src/shared/ui/zIndex.ts).
3. **Production‑first** — TS + ESLint + build без необоснованных warnings.
4. **Файл >300 LOC** — повод расщепить (controller hook + UI).
5. **Blast radius** — рефакторинг вне ТЗ → в backlog.

---

## 1. UI / UX consistency

### 1.1. Используй существующие design tokens

**Цвета и поверхности** — только Tailwind‑семантика из [`src/index.css`](src/index.css) (`@theme inline`):

| Назначение                                        | Tailwind class                | CSS‑переменная                           |
| ------------------------------------------------- | ----------------------------- | ---------------------------------------- |
| Фон приложения                                    | `bg-background`               | `--background`                           |
| Основной текст                                    | `text-foreground`             | `--foreground`                           |
| Карточка / sheet                                  | `bg-card`                     | `--card`                                 |
| Акцент / CTA (оранжевый)                          | `bg-primary` / `text-primary` | `--primary`                              |
| Мягкая подложка блоков                            | `bg-secondary`                | `--secondary`; `--muted` = alias         |
| Приподнятая surface (hover secondary, индикаторы) | `bg-elevated`                 | `--elevated`                             |
| Вторичный текст                                   | `text-muted-foreground`       | `--muted-foreground` (не путать с фоном) |
| Рамка                                             | `border-border`               | `--border`                               |
| Успех / предупреждение                            | `bg-success`, `bg-warning`    | `--success`, `--warning`                 |

```text
// ✅ хорошо
className="bg-card text-foreground border-border"
className="bg-secondary hover:bg-elevated"
className="text-success bg-success/10"

// ❌ запрещено
className="bg-[#141418] text-[#F5F5F7]"
// legacy arbitrary bg через --surface-subtle (удалено)
className="bg-emp border-emp"                    // legacy → primary
```

**Градиенты и тени** — только через CSS‑vars в arbitrary, если нет utility:

```text
className="bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary-cta)]"
```

### 1.2. Не добавляй случайные цвета / размеры / отступы

- Спрашивай: «Этот размер уже есть в scale?» Если нет — это либо ошибка дизайна,
  либо новый токен (обсудить).
- **Padding / margin / gap / size:** только из Tailwind дефолтной шкалы (`p-4`,
  `gap-2`, `min-h-11`, `max-w-xs`). Запрещены arbitrary вроде `px-[22px]`,
  `gap-[10px]`, `h-[42px]` — округляй до ближайшего токена (`px-5`, `gap-2`,
  `size-10.5`). Внутри `<Card />` дефолтный padding — `p-4` через `padding="md"`.

### 1.3. Mobile‑first

- Точка входа — `375×812` (iPhone 13). Любые `sm:` / `md:` / `lg:` модификаторы
  применяются **поверх** mobile baseline.
- Не использовать `desktop:` mental model: WebView Telegram — мобильный target.
- Проверяй iPhone SE (375×667) — самый маленький viewport.

### 1.4. UI primitives — единственный источник элементов

Все интерактивные элементы и поверхности — из `src/components/ui/`:

| Тебе нужно                                 | Используй                                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Кнопка                                     | [`Button`](src/components/ui/button.tsx) с `size: sm/md/lg` (44/48/52 px)                                                                            |
| Поле ввода                                 | [`Input`](src/components/ui/input.tsx) с `variant: default/inline`                                                                                   |
| Карточка‑surface                           | [`Card`](src/components/ui/card.tsx) с `padding`/`emphasis`/`status`                                                                                 |
| Информационный блок (success/warning/info) | [`Callout`](src/components/ui/callout.tsx)                                                                                                           |
| KPI блок (значение + подпись)              | [`KpiRow`](src/components/ui/kpi-row.tsx)                                                                                                            |
| Bottom sheet                               | [`Drawer`](src/components/ui/drawer.tsx)                                                                                                             |
| Modal                                      | [`Modal`](src/components/ui/modal.tsx)                                                                                                               |
| Confirmation                               | [`AlertDialog`](src/components/ui/alert-dialog.tsx)                                                                                                  |
| Toast                                      | [`useToast`](src/hooks/useToast.ts)                                                                                                                  |
| Lazy fallback                              | [`PageSuspense`](src/components/ui/PageSuspense.tsx)                                                                                                 |
| Бейдж                                      | [`Badge`](src/components/ui/badge.tsx) (variants: `sos/verified/direct/boost/pro/stars/...`)                                                         |
| Компактная карточка смены                  | [`ShiftCard`](src/components/ui/shift-card/ShiftCard.tsx) + константы из [`shift-card-styles.ts`](src/components/ui/shift-card/shift-card-styles.ts) |

### 1.5. Паттерны className — не дублировать

Повторяющиеся наборы — в [`ui-patterns.ts`](src/components/ui/ui-patterns.ts):

| Группа                 | Константы (примеры)                                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Поверхности / overlay  | `MODAL_SURFACE_CLASS`, `DRAWER_*`, `SHADOW_MODAL_CLASS`                                                                                                                 |
| Теги, segmented, табы  | `TAG_*`, `SEGMENTED_*`, `TAB_ACTIVE_*`                                                                                                                                  |
| Инпуты, header actions | `INPUT_FIELD_*`, `APP_HEADER_*`                                                                                                                                         |
| Типографика            | `SCREEN_TITLE_CLASS`, `MODAL_TITLE_CLASS`, `HERO_TITLE_CLASS`, `BLOCK_TITLE_CLASS`, `DISPLAY_PRICE_CLASS`, `CARD_PRICE_CLASS`, `LABEL_CAPS_CLASS`, `META_MONO_CLASS`, … |

Карточка смены — [`shift-card-styles.ts`](src/components/ui/shift-card/shift-card-styles.ts) (`SHIFT_CARD_*`; цена — `SHIFT_CARD_PRICE_CLASS` = `CARD_PRICE_CLASS`).

```tsx
// ✅
import { SCREEN_TITLE_CLASS, MODAL_SURFACE_CLASS } from '@/components/ui/ui-patterns'
import { SHIFT_CARD_CLASS, SHIFT_CARD_PRICE_CLASS } from '@/components/ui/shift-card/shift-card-styles'

// ❌ — не возвращать CSS utilities shift-compact-* и surface-* из index.css
// ❌ — не дублировать заголовок экрана вручную
<h1 className="text-2xl font-extrabold …">
```

### 1.6. Не создавай ad‑hoc UI без причины

```tsx
// ❌ запрещено — это card‑паттерн, должен быть <Card />
<div className="rounded-xl border border-border bg-card p-4">…</div>

// ✅ правильно
<Card padding="md">…</Card>
```

Если нужен новый вариант примитива — расширь существующий через `variant` prop,
а не создавай dup.

---

## 2. Styling rules

### 2.1. Запрещено в `className`

ESLint правило `no-restricted-syntax` блокирует:

| Запрет                                                                    | Используй                                                                                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `text-[Npx]` (вне allowlist 9/16/36/52)                                   | Шкала Tailwind: `text-xs` / `text-sm` / `text-base` / `text-lg` / `text-xl` / `text-2xl` / `text-3xl` / `text-4xl` |
| `text-body-*`, `text-meta`, `text-micro`, `text-title-*`, `text-display*` | Удалённые кастомные токены → ближайший Tailwind (см. §2.2)                                                         |
| `bg-[#hex]`                                                               | `bg-primary` / `bg-card` / `bg-secondary` / `bg-success/10`                                                        |
| legacy `--surface-*` arbitrary bg                                         | `bg-secondary` / `bg-elevated` / `border-border`                                                                   |
| `z-[N]`                                                                   | `style={{ zIndex: Z_INDEX.modal }}` (см. [`src/shared/ui/zIndex.ts`](src/shared/ui/zIndex.ts))                     |
| `!important` (вне `motion-reduce:`)                                       | Расширь API примитива через `variant`                                                                              |
| `rounded-[Npx]` (вне allowlist 4px/2rem)                                  | `rounded-sm` (10) / `rounded-md` (12) / `rounded-lg` (14) / `rounded-xl` (18) / `rounded-2xl` (20)                 |

### 2.2. Typography — шкала Tailwind

Кастомные `text-micro` / `text-body-md` и т.п. **сняты с проекта**. Используй
дефолтную шкалу Tailwind (база `16px` в `:root` → `html`).

| Роль в UI                  | Константа (`ui-patterns.ts`)                | Tailwind               | ≈ px    |
| -------------------------- | ------------------------------------------- | ---------------------- | ------- |
| Micro‑лейблы, бейджи, nav  | `LABEL_CAPS_CLASS` / `META_MONO_CLASS`      | `text-xs`              | 12      |
| Body в карточках, подписи  | `BODY_TEXT_CLASS` / `BODY_MUTED_CLASS`      | `text-sm`              | 14      |
| Основной body, инпуты      | —                                           | `text-base`            | 16      |
| Заголовок секции / блока   | `SECTION_TITLE_CLASS` / `BLOCK_TITLE_CLASS` | `text-lg`              | 18      |
| Заголовок экрана (header)  | `SCREEN_TITLE_CLASS`                        | `text-2xl`             | 24      |
| Заголовок модалки / drawer | `MODAL_TITLE_CLASS`                         | `text-xl`              | 20      |
| Hero / splash              | `HERO_TITLE_CLASS`                          | `text-4xl`             | 36      |
| Цена на деталях / KPI      | `DISPLAY_PRICE_CLASS` / `KPI_VALUE_CLASS`   | `text-2xl` / `text-lg` | 24 / 18 |

Заголовки `h1`–`h4` в `@layer base` ([`index.css`](src/index.css)) и константы выше — единственный источник; не дублировать `text-lg font-semibold` / `text-2xl font-extrabold` вручную.

**Allowlist arbitrary `text-[Npx]`** (ESLint): `9px`, `16px` (iOS zoom guard), `36px`, `52px` (splash).

### 2.2.1. Radius — единая шкала

Значения из `--radius` в [`index.css`](src/index.css):

| Utility        | px   | Типичное применение                           |
| -------------- | ---- | --------------------------------------------- |
| `rounded-sm`   | 10   | чипы, segmented control                       |
| `rounded-md`   | 12   | кнопки                                        |
| `rounded-lg`   | 14   | карточки, инпуты (`Card`, `SHIFT_CARD_CLASS`) |
| `rounded-xl`   | 18   | callout                                       |
| `rounded-2xl`  | 20   | modal, drawer top                             |
| `rounded-full` | pill | аватары, switch                               |

**Allowlist arbitrary `rounded-[…]`**: `4px` (микро‑бейдж), `2rem` (декоративный spinner).

### 2.3. Z‑index ladder

```ts
// src/shared/ui/zIndex.ts — единственный источник истины
export const Z_INDEX = {
  base: 0,
  bottomNav: 30,
  stickyHeader: 35,
  overlay: 40,
  drawer: 50,
  modal: 60,
  popover: 70,
  alertDialog: 80,
  toast: 90,
}
```

Любой `position: fixed/absolute` слой → `style={{ zIndex: Z_INDEX.X }}`. Никаких
`z-50` / `z-[60]` без обоснования.

### 2.4. Safe‑area utilities

```css
.pb-safe       /* max(env(safe-area-inset-bottom), 16px) — для контента */
.pb-safe-nav   /* bottom nav / fixed нижняя навигация */
.pt-safe
.bottom-safe   /* bottom: env(safe-area-inset-bottom) */
.safe-area-bottom
```

Не плодить ручные arbitrary safe-area padding-классы — используй утилиту.

### 2.5. Semantic tokens вместо raw values

```tsx
// ❌
'bg-[rgba(62,201,126,0.1)] border-[rgba(62,201,126,0.4)]'

// ✅
'bg-success/10 border-success/40'
```

### 2.6. Роли и цвет

Визуально все роли используют **единую гамму** (`primary`, `secondary`, `elevated`). Категория аккаунта для копирайта — `getRoleCategory(role)` из [`roles.types.ts`](src/shared/types/roles.types.ts), не для CSS.

```tsx
// ✅
<button className="bg-primary text-primary-foreground">CTA</button>
```

```text
// ❌ — удалено
'bg-role-employee' | 'getRoleTheme' | 'bg-emp'
```

### 2.7. Отступы между элементами — `gap`, не margin

Для вертикальных/горизонтальных стеков и сеток — **`gap` на flex/grid-контейнере**, не `margin` на дочерних элементах.

| ❌ Запрещено для стеков                           | ✅ Используй                                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `space-y-*`                                       | `flex flex-col gap-*` или `ui-density-stack` |
| `mt-*` / `mb-*` между соседними блоками в колонке | `gap` на родителе                                                                            |
| `ui-density-mb` на заголовках секций              | `ui-density-stack` на обёртке секции                                                         |

**Margin допустим** только для: позиционирования (`absolute`, overlay), оптического выравнивания иконки (`mt-0.5` у inline-иконки), отрицательных overlap (`-mt-*`), внешних отступов компонента от соседей снаружи (если родитель не flex/grid-стек).

```tsx
// ❌
<div>
  <h3 className="mb-4">Заголовок</h3>
  <Card />
</div>

// ✅
<div className="ui-density-stack">
  <h3>Заголовок</h3>
  <Card />
</div>
```

---

## 3. Component architecture

### 3.1. UI primitives = feature‑agnostic

Новые низкоуровневые примитивы в [`src/components/ui`](src/components/ui)
должны быть feature‑agnostic: без импортов из `features/*` и без знания доменных
типов (`Shift`, `User`, role‑specific contracts).

В `src/components/ui` уже есть product-level компоненты, которые переиспользуются
между экранами (`shift-card`, `shift-details-screen`). Их можно поддерживать на
месте, но новые доменные компоненты по умолчанию создавай в `features/<домен>/ui`.
Если компонент становится общим для нескольких доменов, выноси его только после
появления реального повторного использования.

### 3.2. Feature‑specific компоненты живут в `features/<домен>/`

```
src/features/<feature>/
├── model/                  # state / hooks / utils / типы
│   ├── hooks/use*.ts       # controllers + sub-hooks
│   ├── utils/*.ts          # pure functions
│   └── types.ts
└── ui/                     # компоненты
    ├── *Page.tsx           # страница
    └── components/         # фичевые компоненты
```

### 3.3. Большой компонент = controller hook + declarative UI

Если компонент >200 LOC и содержит state + handlers + derived values:

```ts
// model/hooks/useMyController.ts — вся логика
export const useMyController = (...) => {
  const [state, setState] = useState(...)
  const derived = useMemo(...)
  const handleX = useCallback(...)
  return { state, derived, handleX }
}

// ui/MyComponent.tsx — только JSX
export const MyComponent = (props) => {
  const c = useMyController(props)
  return <div>… {c.derived} …</div>
}
```

### 3.4. Не держать 300+ LOC без причины

| LOC     | Действие                                                                                    |
| ------- | ------------------------------------------------------------------------------------------- |
| <200    | OK                                                                                          |
| 200–300 | Думаем о расщеплении. Проверяем: есть ли логически независимые подкомпоненты или sub‑hooks? |
| 300–400 | Обоснование требуется в PR. Composition layers (`use*PageModel`) — допустимо.               |
| 400+    | Обязательное расщепление. Pure type‑файлы — исключение.                                     |

### 3.5. Повторяющиеся паттерны → reusable primitives

3+ одинаковых div‑паттерна в кодовой базе = повод для нового примитива.
Сначала проверь, не покрыт ли уже существующим (Card / Callout / KpiRow).

---

## 4. Hooks rules

### 4.1. `useMemo` — только при реальной необходимости

```ts
// ❌ over-memoization
const visibleRoles = useMemo(() => subRoles, [subRoles])
const websiteValue = useMemo(() => supplier?.website?.trim() || '', [supplier?.website])

// ✅ оставить
const filteredItems = useMemo(() => items.filter(complexPredicate).sort(complexComparator), [items]) // дорогой расчёт

const stableProps = useMemo(() => ({ a, b }), [a, b]) // feed в memo‑child
```

**Правило:** мемоизируй, если:

1. Расчёт дорогой (>0.5ms) или содержит большие данные;
2. Результат feed в `useEffect deps` или передаётся в `memo()` дочерний компонент;
3. Иначе — обычная переменная при рендере.

### 4.2. `useCallback` — только при реальной необходимости

Те же правила, что и `useMemo`. Если функция не передаётся в `memo()` дочерний
компонент или `useEffect deps`, не оборачивай.

### 4.3. `useEffect` — только для external sync / subscriptions / controlled reset

```ts
// ✅ external sync
useEffect(() => {
  return onAppEvent(APP_EVENTS.OPEN_FEED_FILTERS, () => openFilters())
}, [openFilters])

// ✅ DOM subscription с cleanup
useEffect(() => {
  document.addEventListener('mousedown', handler)
  return () => document.removeEventListener('mousedown', handler)
}, [])

// ✅ controlled init из props (с guard)
useEffect(() => {
  if (manualPhone) return // не перезаписываем уже введённое
  if (phoneFromProfile) setManualPhone(formatPhoneInput(phoneFromProfile))
}, [phoneFromProfile])

// ❌ derived state в effect
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// ✅ derived state в render
const fullName = `${firstName} ${lastName}`
```

### 4.4. `useEffect` НЕ для derived state

Если ты вычисляешь значение из props/state и пишешь в state — это антипаттерн.
Считай при рендере (или `useMemo` для дорогого расчёта).

### 4.5. Subscriptions / listeners → cleanup обязателен

```ts
// ❌
useEffect(() => {
  telegram?.onEvent('fullscreenChanged', handler)
}, [telegram])

// ✅
useEffect(() => {
  if (!telegram?.onEvent) return
  telegram.onEvent('fullscreenChanged', handler)
  return () => telegram.offEvent?.('fullscreenChanged', handler)
}, [telegram])
```

Ещё лучше — для external state mirror используй `useSyncExternalStore` (см.
[`useTelegramFullscreen`](src/contexts/telegram/useTelegramFullscreen.ts)).

### 4.6. ESLint‑правило `react-hooks/exhaustive-deps` — strict (`error`)

`react-hooks/set-state-in-effect` — warn. Локальный `eslint-disable` допустим
только с осознанным комментарием (external sync с внешней системой).

---

## 5. Forms

### 5.1. Validation — pure helpers

```ts
// ❌ inline валидация в useState/useMemo
const error = useMemo(() => {
  if (!startTime) return null
  // 30 строк логики
}, [startTime, endTime])

// ✅ pure function в utils
// model/utils/myValidation.ts
export const validateTimeRange = (start, end, t): string | null => {
  if (!start || !end) return null
  ...
}

// hook
const error = validateTimeRange(start, end, t)  // считаем при рендере
```

Pure validators легко тестируются, переиспользуются и не зависят от React.

### 5.2. Submission logic — отдельно от UI

```
model/hooks/
├── useMyFormState.ts        # useState + reset
├── useMyFormSubmission.ts   # mutation + error handling + toast
└── useMyForm.ts             # composition
```

См. эталон: [`useAddShiftForm`](src/features/activity/model/hooks/useAddShiftForm.ts) →
делегирует в `useAddShiftFormState` + `useAddShiftFormSubmission`.

### 5.3. Ошибки формы — типизированы

```ts
// ✅
export type AddShiftFieldErrors = Partial<
  Record<'location' | 'requirements' | 'description' | 'specializations', string>
>

const [fieldErrors, setFieldErrors] = useState<AddShiftFieldErrors>({})

// ❌
const [fieldErrors, setFieldErrors] = useState<any>({})
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}) // слишком широкий
```

### 5.4. Reset / init logic — явно изолирован

```ts
// ✅
const resetForm = useCallback(() => {
  setTitle('')
  setDate(null)
  setSubmitError(null)
  setFieldErrors({})
}, [])

// При закрытии drawer
const handleDrawerOpenChange = (next: boolean) => {
  if (!next) resetForm()
  onOpenChange(next)
}
```

`resetForm` — единственная точка сброса. Не повторяй `setX('')` россыпью.

---

## 6. Mobile WebApp rules

- **Touch targets ≥ 44px** (WCAG 2.5.5). `Button.size`: `sm=44 / md=48 / lg=52`. Icon‑кнопки `h-11 w-11`. Запрещено `h-9`/`h-10` на интерактиве.
- **Safe‑area:** `fixed bottom-0` → утилиты `pb-safe` / `pb-safe-nav` / `bottom-safe`. Ручные `pb-[calc(...env(safe-area)...)]` запрещены.
- **Keyboard‑aware:** drawer высота `min(85vh, calc(100vh - bottomOffset - 20px))` — см. [`Drawer`](src/components/ui/drawer.tsx).
- **Маленькие экраны:** поддерживаем iPhone SE (375×667), Android (360×640). `truncate` для длинных строк (имена, адреса).
- **Scroll jank:** `* { transition: all }` запрещено. Theme transitions — только на `body` / `.themed-surface`.

---

## 7. Accessibility

### 7.1. Интерактивные элементы

- Кнопки → `<button type="button">`. Не использовать `<div onClick>` без причины.
- Если `<div>` логически интерактивный (например, swipeable card):
  ```tsx
  <div
    role="button"
    tabIndex={0}
    aria-label="Открыть детали смены"
    onClick={handleOpen}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleOpen()
      }
    }}
    className="… focus-visible:ring-2 focus-visible:ring-primary outline-none"
  >
  ```

### 7.2. Icon buttons → `aria-label`

```tsx
// ❌
<Button variant="outline" size="sm">
  <X className="w-4 h-4" />
</Button>

// ✅
<Button variant="outline" size="sm" aria-label={t('common.close')}>
  <X className="w-4 h-4" aria-hidden />
</Button>
```

### 7.3. Focus‑visible states обязательны

Любой интерактивный элемент должен иметь видимый focus ring. Стандарт:

```css
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
```

Tailwind‑утилита уже встроена в `Button`, `BottomNav` через primitive.

### 7.4. `eslint-disable jsx-a11y/*` — только с комментарием

```tsx
// ✅
{/* alertdialog — фокус‑ловушка диалога; pointerdown/click stopPropagation
    нужен для bubbling‑guard, сам элемент не интерактивный. */}
{/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
<div role="alertdialog" onClick={stopPropagation}>…</div>

// ❌
// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
<div onClick={...}>…</div>
```

### 7.5. ARIA attributes

- `role="combobox"` → требует `aria-expanded`, `aria-haspopup="listbox"`,
  `aria-controls={listboxId}`.
- `role="dialog"` / `"alertdialog"` → требует `aria-modal="true"`,
  `aria-labelledby`, `aria-describedby`.
- `aria-invalid` — только на `input` / `combobox` / form‑related элементах.

---

## 8. Performance

### 8.1. Не добавляй тяжёлые зависимости без причины

- Перед `npm i …` — проверь, нет ли уже подобной утилиты:
  - Animations → `motion` (уже есть);
  - Icons → `lucide-react` (уже есть);
  - HTTP/state → RTK Query (уже есть);
  - Forms → собственная архитектура `model/hooks` (нет нужды в react‑hook‑form).
- Bundle budget: main initial JS ≤ 250 KB gzip. Фактический размер фиксировать
  только по свежему `npm run build`.

### 8.2. Lazy‑load route‑level pages

Все pages в `src/components/TabContent.tsx` уже через `React.lazy`. Если
добавляешь новый таб — следуй паттерну:

```ts
const NewPage = lazy(() => import('@/features/new/ui/NewPage').then(m => ({ default: m.NewPage })))
```

`<PageSuspense>` обёртывает их автоматически.

### 8.3. Не делай over‑memoization

См. §4.1, 4.2. Каждый `useMemo` без обоснования — стоит больше, чем экономит.

### 8.4. Оптимизация изображений

- Аватарки → `<img loading="lazy" decoding="async">` (см. [`Avatar`](src/components/ui/avatar.tsx)).
- Если бэк добавит ресайзинг (`?w=88`) — использовать `srcSet` для retina.
- WebP/AVIF — preferred (когда подключим image pipeline на бэке).

### 8.5. Избегай layout shift

- Аватарки / превью с фиксированными размерами `w-11 h-11` (не `aspect-square` без явной высоты).
- Skeleton loaders должны иметь те же габариты, что и финальный контент.
- Для webfont при подключении внешних шрифтов использовать `font-display: swap`;
  не блокировать first paint загрузкой шрифта.

---

## 9. Verification before merge

**Обязательно перед PR:**

```bash
npm run lint           # 0 errors (jsx-a11y + no-restricted-syntax включены)
npm run format:check
npm run build          # tsc -b + vite build, 0 TS errors, bundle delta <10%
```

**Если меняется UI — также:**

- Smoke на mobile viewport — экраны, которые задача затронула.
- `npm run test:visual` (или `test:visual:update` после намеренных изменений).
- Design‑system violations (`text-[Npx]`, `bg-[#hex]`, `z-[N]`, legacy токены) — `0` или allowlist.

**Smoke screens (минимум при системных UI‑изменениях):** Boot · Onboarding · Feed · Applied · Mine · Me · Restaurants · Suppliers · Dark/Light.

---

## 10. Output format (для AI‑ассистента)

После каждой нетривиальной задачи дай summary:

- **Что изменено** — 1‑3 предложения.
- **Затронутые файлы** — таблица `файл / что`.
- **Public API** — shape сохранён / изменён (как).
- **Verification** — какие команды прогнал, реальный результат (не пересказ).
- **Риски** и **Что осталось** — если есть.

Принципы: только подтверждённые утверждения; конкретика (bundle delta в KB, а не «практически не изменился»); warnings не прятать; не предлагать улучшения вне ТЗ — только риски и блокеры.

---

## 11. Escalation

- **Нарушить дизайн‑систему** (цвет/размер вне scale) → подними в summary, объясни, предложи токен.
- **Refactor вне ТЗ** → в «Что осталось», **не делай** в текущем PR.
- **Красная сборка** → чини или откатывай.
- **Бизнес‑интеграция без контракта** (платежи, Stars, auth) → документируй в `HANDOFF.md`, не выдумывай.

---

## 12. Anti‑patterns (catalog)

| ❌ Никогда не делай                                       | ✅ Используй                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| `bg-[#FF6B2C]`, `text-[15px]`, `z-[200]`, `rounded-[Npx]` | Tailwind‑токены, `Z_INDEX.X`, allowlist (§2.1)                         |
| `!important` в JSX className                             | Расширь API примитива через `variant`                                  |
| `<div onClick>` без a11y                                 | `<button>` или `role` + `tabIndex` + `aria-label` + keydown            |
| `<div className="rounded-xl border bg-card p-4">`        | `<Card padding="md">`                                                  |
| Hand‑rolled аватар                                       | `<Avatar>` / `<AvatarImage>` / `<AvatarFallback>`                      |
| Кастомный `fixed bottom-0` CTA                           | `BottomActionBar` / `OnboardingBottomCta` / `DrawerFooter` |
| `<DrawerFooter className="sticky bottom-0 z-10">`        | `<DrawerFooter>` (base уже корректен)                                  |
| `font-mono`, `tracking-[Nem]`                            | `font-mono-resta`, `tracking-wide/wider/widest`                        |
| `text-sm font-medium` как label формы                    | `PROFILE_SECTION_LABEL_CLASS` (через `FormField`)                      |
| `bg-primary/8`, `/14`, `bg-background/95`                | `/10`, `/15`, `/92` (§14.4)                                            |
| `<button className="h-9 w-9">`                           | `<Button size="sm">` (h‑11 = 44px)                                     |
| `useEffect(() => setLocal(prop), [prop])`                | `const [local, set] = useState(prop)` + явный controlled init          |
| `useMemo(() => count > 0, [count])`                      | `const isActive = count > 0`                                           |
| Subscription без cleanup                                 | `return () => removeEventListener(...)`                                |
| `* { transition: all }`                                  | `body, .themed-surface { transition: bg-color 0.2s }`                  |
| `console.log/error/warn`                                 | `@/utils/logger`                                                       |
| UI primitive импортирует из `features/*`                 | Вынести domain в `@/shared/<domain>/`                                  |
| Барьер `index.ts` с ≤2 потребителями                     | Прямой импорт                                                          |
| Deprecated alias без deadline                            | Удалить в той же PR                                                    |
| `useCallback(() => fn(), [fn])` без агрегации            | Использовать `fn` напрямую                                             |
| Boolean prop, который никогда не передаётся как `true`   | Удалить из interface и call sites                                      |
| Поле в типе/маппинге, которое нигде не рендерится        | Удалить из типа и mapping‑функции                                      |

---

## 13. Pre‑merge чек‑лист (TL;DR)

- [ ] **Build / lint / format** — все три зелёные.
- [ ] **Архитектура** — UI primitives не импортируют из features (§14.1); общие shift‑утилиты — из `@/shared/shifts/`.
- [ ] **Tokens** — цвета, типографика, радиусы, z‑index — из ui-patterns / index.css; opacity по §14.4.
- [ ] **UI primitives** — `Button`, `Input`, `Card`, `Avatar`, `BottomActionBar` / `DrawerFooter` — не ad‑hoc div'ы.
- [ ] **Mobile** — touch ≥44px, safe‑area utility, truncate для длинных строк.
- [ ] **A11y** — aria‑label на icon buttons, focus‑visible state.
- [ ] **Hooks** — нет over‑memo, нет `useEffect` для derived state, cleanup у subscriptions.
- [ ] **Файлы ≤300 LOC** (или обоснование).
- [ ] **Нет мёртвого кода** — пропсы, поля типов, exports, deprecated alias, барьеры с ≤2 потребителями.
- [ ] **Логи** — `logger`, не `console.*`.

Если что‑то не выполнено — **не мерджить**.

---

## 14. Архитектура и cleanup (продолжение `.cursorrules`)

### 14.1. Направленность зависимостей

```
features/<X> ──→ shared/* ──→ components/ui/*  (feature-agnostic)
```

- `components/ui/*` **не** импортирует из `features/*`. Domain‑тип/утилита, нужная UI → выноси в `shared/<domain>/`.
- Cross‑feature импорты допустимы только из `navigation`. Иное → перенести в `shared/`.
- Канонические shared‑модули: `shared/shifts/`, `shared/ui/`, `shared/i18n/`, `shared/api/`, `shared/utils/`.

### 14.2. Single‑source tokens (специфика)

| Что                 | Источник                                          | НЕ использовать                          |
| ------------------- | ------------------------------------------------- | ---------------------------------------- |
| Mono font           | `font-mono-resta`                                 | `font-mono` (Tailwind default)           |
| Tracking            | `tracking-wide` / `wider` / `widest`              | `tracking-[Nem]` (вне splash)            |
| Заголовок секции    | `SECTION_TITLE_CLASS` (text‑lg)                   | `HERO_TITLE_CLASS` вне hero              |
| Label формы         | `PROFILE_SECTION_LABEL_CLASS` (через `FormField`) | `text-sm font-medium` ad‑hoc             |
| Label switch‑строки | `SHIFT_CARD_TITLE_CLASS` + `SHIFT_CARD_SUB_CLASS` | ручной `text-sm font-medium mb-1`        |
| Body                | `BODY_TEXT_CLASS` / `BODY_MUTED_CLASS`            | ручные `text-sm text-foreground/muted-…` |

### 14.3. UI primitives vs ad‑hoc

- Аватары — **только** `<Avatar>` / `<AvatarImage>` / `<AvatarFallback>`. Никаких `<div className="rounded-full overflow-hidden"><img/></div>`.
- Нижние CTA — **только** `BottomActionBar` / `OnboardingBottomCta` / `DrawerFooter`. Самописных `fixed bottom-0` баров не делать.
- `DrawerFooter` базово даёт `mt-auto`, `shrink-0`, `border-t border-border/50`, `bg-background/92` — не накладывай `sticky bottom-0 z-N`, `shrink-0`, кастомные border поверх.
- Локальный wrapper (`SectionLabel` и пр.) оправдан только при ≥4 использованиях в одном файле и нетривиальной структуре. Иначе инлайн константу.

### 14.4. Канон opacity для семантических цветов

| Token                   | OK                                                    | НЕ ОК                  |
| ----------------------- | ----------------------------------------------------- | ---------------------- |
| `bg-background`         | `/65` BottomNav · `/82` ResultOverlay · `/92` sticky  | `/95`                  |
| `bg-primary`            | `/5` · `/10` · `/15`                                  | `/8`, `/14`, `/[0.06]` |
| `bg-destructive`        | `/10` · `/15` · `/20`                                 | `/8`                   |
| `bg-success`            | `/10` (bg) · `/15` (filled)                           | `/8`                   |
| `bg-warning`            | `/10`                                                 | `/8`                   |
| `bg-black` (overlay)    | `/20–/40` dropdown · `/50` modal/drawer               | `/60`                  |
| `border-border`         | `/50` стандарт · `/60` chrome                         | `/40`, `/70`           |
| `text-muted-foreground` | `/30` empty stars · `/70` hint                        | `/40`, `/50`, `/15`    |

Если разница с утверждённым `/N` < 5 — используй существующий.

### 14.5. Анти‑оверхед

- Барьер `index.ts` — только при **≥3** потребителях.
- Тривиальный `useCallback(() => fn(), [fn])` без агрегации — используй `fn` напрямую.
- Тривиальный alias (`A = B`) — не создавать.
- Deprecated export без deadline — удалить в той же PR.
- Магические числа (`tracking-[0.04em]`, `tracking-[0.08em]`, `tracking-[0.22em]` в одном файле) — перейти на токены или комментировать каждое отклонение.

### 14.6. Перед написанием helper'а

`grep -rn 'имя|похожий regexp' src/` и переиспользуй. Хранилища pure‑утилит: `shared/shifts/formatting.ts` (shift), `components/ui/shift-card/shift-card-utils.ts` (компактная карточка), `shared/utils/` (общие).

### 14.7. Когда хук пора разбить

- ≥3 `useEffect` + ≥5 `useState` + DOM‑математика → экстракт в дочерний хук (`useDropdownPosition` и т.п.).
- Файл >300 LOC, ≥40% — вычисления, не JSX → controller hook + декларативный UI.

### 14.8. Cleanup перед закрытием задачи

Grep‑аудит: объявленный, но не deструктурируемый prop · поле в типе/маппинге, которое нигде не рендерится · `console.*` · пустые директории · неиспользуемые exports / deprecated alias.

### 14.9. Когда оставлять «дубликат»

Не объединяй то, что только выглядит одинаково:
- `Modal` vs `AlertDialog` — разная семантика и focus management.
- Два `LocationField` — разные API/сценарии (форма vs onboarding) → переименуй, не объединяй.
- `--warning` и `--stars` — одинаковый hex, разная семантика (warning vs premium).

Объединяй только при идентичной семантике.
