# AI_DEVELOPMENT_GUIDELINES.md

> **UI и frontend engineering для Resta.** Не дублирует [`.cursorrules`](.cursorrules) (стек, Redux, структура).
> Контракты бэкенда — [`HANDOFF.md`](HANDOFF.md).

---

## Иерархия документов и приоритет

| # | Источник | Зона ответственности |
|---|----------|----------------------|
| 1 | Задача пользователя (чат / PR) | — |
| 2 | **`.cursorrules`** | Стек, структура, Redux, TypeScript, общие принципы |
| 3a | **`AI_DEVELOPMENT_GUIDELINES.md`** (этот файл) | Design system, UI-примитивы, hooks, forms, a11y, verification |
| 3b | **`HANDOFF.md`** | Эндпоинты и контракты для интеграции с бэкендом |
| 4 | Паттерны целевых файлов | Локальные соглашения модуля |

**При расхождении между документами:** `.cursorrules` > специализированный документ **в его зоне** > код. Между `AI_DEVELOPMENT_GUIDELINES.md` и `HANDOFF.md` конфликта нет — разные зоны.

---

## 0. Принципы (UI / engineering)

1. **Stability over novelty.** Перед добавлением — проверь, есть ли уже примитив/токен.
2. **Один источник истины.** Цвета и радиусы — [`src/index.css`](src/index.css); className-паттерны — [`ui-patterns.ts`](src/components/ui/ui-patterns.ts), [`shift-card-styles.ts`](src/components/ui/shift-card/shift-card-styles.ts); z-index — [`zIndex.ts`](src/shared/ui/zIndex.ts).
3. **Production-first.** TS + ESLint + build без необоснованных warnings.
4. **Файл >300 LOC** — повод задуматься о расщеплении (controller hook + UI).
5. **Blast radius.** Рефакторинг вне ТЗ — в backlog, не в текущий PR.

---

## 1. UI / UX consistency

### 1.1. Используй существующие design tokens

**Цвета и поверхности** — только Tailwind‑семантика из [`src/index.css`](src/index.css) (`@theme inline`):

| Назначение | Tailwind class | CSS‑переменная |
|------------|----------------|----------------|
| Фон приложения | `bg-background` | `--background` |
| Основной текст | `text-foreground` | `--foreground` |
| Карточка / sheet | `bg-card` | `--card` |
| Акцент / CTA (оранжевый) | `bg-primary` / `text-primary` | `--primary` |
| Мягкая подложка блоков | `bg-secondary` | `--secondary`; `--muted` = alias |
| Приподнятая surface (hover secondary, индикаторы) | `bg-elevated` | `--elevated` |
| Вторичный текст | `text-muted-foreground` | `--muted-foreground` (не путать с фоном) |
| Рамка | `border-border` | `--border` |
| Успех / предупреждение | `bg-success`, `bg-warning` | `--success`, `--warning` |

```tsx
// ✅ хорошо
className="bg-card text-foreground border-border"
className="bg-secondary hover:bg-elevated"
className="text-success bg-success/10"

// ❌ запрещено
className="bg-[#141418] text-[#F5F5F7]"
className="bg-[var(--surface-subtle)]"           // legacy, удалено
className="bg-emp border-emp"                    // legacy → primary
```

**Градиенты и тени** — только через CSS‑vars в arbitrary, если нет utility:

```tsx
className="bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary-cta)]"
```

### 1.2. Не добавляй случайные цвета / размеры / отступы

- Спрашивай: «Этот размер уже есть в scale?» Если нет — это либо ошибка дизайна,
  либо новый токен (обсудить).
- **Padding / margin / gap:** только из Tailwind дефолтной шкалы (`p-2`, `p-3`, `p-4`,
  `gap-1.5`). Внутри `<Card />` дефолтный padding — `p-4` через `padding="md"`.

### 1.3. Mobile‑first

- Точка входа — `375×812` (iPhone 13). Любые `sm:` / `md:` / `lg:` модификаторы
  применяются **поверх** mobile baseline.
- Не использовать `desktop:` mental model: WebView Telegram — мобильный target.
- Проверяй iPhone SE (375×667) — самый маленький viewport.

### 1.4. UI primitives — единственный источник элементов

Все интерактивные элементы и поверхности — из `src/components/ui/`:

| Тебе нужно | Используй |
|------------|-----------|
| Кнопка | [`Button`](src/components/ui/button.tsx) с `size: sm/md/lg` (44/48/52 px) |
| Поле ввода | [`Input`](src/components/ui/input.tsx) с `variant: default/inline` |
| Карточка‑surface | [`Card`](src/components/ui/card.tsx) с `padding`/`emphasis`/`status` |
| Информационный блок (success/warning/info) | [`Callout`](src/components/ui/callout.tsx) |
| KPI блок (значение + подпись) | [`KpiRow`](src/components/ui/kpi-row.tsx) |
| Bottom sheet | [`Drawer`](src/components/ui/drawer.tsx) |
| Modal | [`Modal`](src/components/ui/modal.tsx) |
| Confirmation | [`AlertDialog`](src/components/ui/alert-dialog.tsx) |
| Toast | [`useToast`](src/hooks/useToast.ts) |
| Lazy fallback | [`PageSuspense`](src/components/ui/PageSuspense.tsx) |
| Бейдж | [`Badge`](src/components/ui/badge.tsx) (variants: `sos/verified/direct/boost/pro/stars/...`) |
| Компактная карточка смены | [`ShiftCard`](src/components/ui/shift-card/ShiftCard.tsx) + константы из [`shift-card-styles.ts`](src/components/ui/shift-card/shift-card-styles.ts) |

### 1.5. Паттерны className — не дублировать

Повторяющиеся наборы — в [`ui-patterns.ts`](src/components/ui/ui-patterns.ts):

| Группа | Константы (примеры) |
|--------|---------------------|
| Поверхности / overlay | `MODAL_SURFACE_CLASS`, `DRAWER_*`, `SHADOW_MODAL_CLASS` |
| Теги, segmented, табы | `TAG_*`, `SEGMENTED_*`, `TAB_ACTIVE_*` |
| Инпуты, header actions | `INPUT_FIELD_*`, `APP_HEADER_*` |
| Типографика | `SCREEN_TITLE_CLASS`, `MODAL_TITLE_CLASS`, `HERO_TITLE_CLASS`, `BLOCK_TITLE_CLASS`, `DISPLAY_PRICE_CLASS`, `CARD_PRICE_CLASS`, `LABEL_CAPS_CLASS`, `META_MONO_CLASS`, … |

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

| Запрет | Используй |
|--------|-----------|
| `text-[Npx]` (вне allowlist 9/16/36/52) | Шкала Tailwind: `text-xs` / `text-sm` / `text-base` / `text-lg` / `text-xl` / `text-2xl` / `text-3xl` / `text-4xl` |
| `text-body-*`, `text-meta`, `text-micro`, `text-title-*`, `text-display*` | Удалённые кастомные токены → ближайший Tailwind (см. §2.2) |
| `bg-[#hex]` | `bg-primary` / `bg-card` / `bg-secondary` / `bg-success/10` |
| `bg-[var(--surface-*)]` | `bg-secondary` / `bg-elevated` / `border-border` |
| `z-[N]` | `style={{ zIndex: Z_INDEX.modal }}` (см. [`src/shared/ui/zIndex.ts`](src/shared/ui/zIndex.ts)) |
| `!important` (вне `motion-reduce:`) | Расширь API примитива через `variant` |
| `rounded-[Npx]` (вне allowlist 4px/2rem) | `rounded-sm` (10) / `rounded-md` (12) / `rounded-lg` (14) / `rounded-xl` (18) / `rounded-2xl` (20) |

### 2.2. Typography — шкала Tailwind

Кастомные `text-micro` / `text-body-md` и т.п. **сняты с проекта**. Используй
дефолтную шкалу Tailwind (база `16px` в `:root` → `html`).

| Роль в UI | Константа (`ui-patterns.ts`) | Tailwind | ≈ px |
|-----------|------------------------------|----------|------|
| Micro‑лейблы, бейджи, nav | `LABEL_CAPS_CLASS` / `META_MONO_CLASS` | `text-xs` | 12 |
| Body в карточках, подписи | `BODY_TEXT_CLASS` / `BODY_MUTED_CLASS` | `text-sm` | 14 |
| Основной body, инпуты | — | `text-base` | 16 |
| Заголовок секции / блока | `SECTION_TITLE_CLASS` / `BLOCK_TITLE_CLASS` | `text-lg` | 18 |
| Заголовок экрана (header) | `SCREEN_TITLE_CLASS` | `text-2xl` | 24 |
| Заголовок модалки / drawer | `MODAL_TITLE_CLASS` | `text-xl` | 20 |
| Hero / splash | `HERO_TITLE_CLASS` | `text-4xl` | 36 |
| Цена на деталях / KPI | `DISPLAY_PRICE_CLASS` / `KPI_VALUE_CLASS` | `text-2xl` / `text-lg` | 24 / 18 |

Заголовки `h1`–`h4` в `@layer base` ([`index.css`](src/index.css)) и константы выше — единственный источник; не дублировать `text-lg font-semibold` / `text-2xl font-extrabold` вручную.

**Allowlist arbitrary `text-[Npx]`** (ESLint): `9px`, `16px` (iOS zoom guard), `36px`, `52px` (splash).

### 2.2.1. Radius — единая шкала

Значения из `--radius` в [`index.css`](src/index.css):

| Utility | px | Типичное применение |
|---------|-----|---------------------|
| `rounded-sm` | 10 | чипы, segmented control |
| `rounded-md` | 12 | кнопки |
| `rounded-lg` | 14 | карточки, инпуты (`Card`, `SHIFT_CARD_CLASS`) |
| `rounded-xl` | 18 | callout |
| `rounded-2xl` | 20 | modal, drawer top |
| `rounded-full` | pill | аватары, switch |

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
.pb-safe-cta   /* calc(1.25rem + env) — для sticky CTA */
.pt-safe
.bottom-safe   /* bottom: env(safe-area-inset-bottom) */
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

// ❌ — удалено
'bg-role-employee' | 'getRoleTheme' | 'bg-emp'
```

---

## 3. Component architecture

### 3.1. Shared UI = feature‑agnostic

[`src/components/ui/*`](src/components/ui) НЕ должен импортировать ничего из
`features/*`. Если примитив знает про `Shift` или `User` — он не shared, перенеси
в `features/feed/ui/components/...`.

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

| LOC | Действие |
|-----|----------|
| <200 | OK |
| 200–300 | Думаем о расщеплении. Проверяем: есть ли логически независимые подкомпоненты или sub‑hooks? |
| 300–400 | Обоснование требуется в PR. Composition layers (`use*PageModel`) — допустимо. |
| 400+ | Обязательное расщепление. Pure type‑файлы — исключение. |

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
const filteredItems = useMemo(() =>
  items.filter(complexPredicate).sort(complexComparator), [items])  // дорогой расчёт

const stableProps = useMemo(() => ({ a, b }), [a, b])  // feed в memo‑child
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
  if (manualPhone) return  // не перезаписываем уже введённое
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
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})  // слишком широкий
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

### 6.1. Touch targets ≥ 44px (WCAG 2.5.5)

- `Button.size`: `sm = 44px`, `md = 48px`, `lg = 52px` — минимум 44.
- Icon‑кнопки: `h-11 w-11` (44×44).
- Запрещено: `h-9` (36px), `h-10` (40px) для интерактивных элементов.
- Скелетоны / декорации могут быть меньше — это не интерактив.

### 6.2. Telegram safe‑area

- Любой `fixed bottom-0` контент → `pb-safe` или `pb-safe-cta`.
- Не использовать ручные `pb-[calc(...env(safe-area)...)]`.

### 6.3. Keyboard‑aware layout

- Telegram WebApp может не поднимать drawer над клавиатурой.
- Высота drawer: `min(85vh, calc(100vh - bottomOffset - 20px))` — см.
  [`Drawer`](src/components/ui/drawer.tsx).
- Проверяй открытый input в нижней половине drawer'а.

### 6.4. Маленькие экраны

- iPhone SE (375×667), Android small (360×640) — поддерживаемые.
- Не делать `min-w-[480px]` контент в drawer.
- `truncate` / `text-ellipsis` для длинных строк — обязательно для имён, адресов.

### 6.5. Scroll jank

- Не добавлять глобальные transitions на `*` (`* { transition: all }` — запрещено).
- Theme transitions — только на `body` / `.themed-surface`:
  ```css
  body { transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
  ```
- Heavy lists → `react-virtual` (если будет потребность); пока используется
  `useVacanciesInfiniteList` с пагинацией.

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

Tailwind‑утилита уже встроена в `Button`, `IconAction`, `BottomNav` через primitive.

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
- Bundle budget: main initial JS ≤ 250 KB gzip. Сейчас ~208 KB.

### 8.2. Lazy‑load route‑level pages

Все pages в `src/components/TabContent.tsx` уже через `React.lazy`. Если
добавляешь новый таб — следуй паттерну:

```ts
const NewPage = lazy(() =>
  import('@/features/new/ui/NewPage').then(m => ({ default: m.NewPage }))
)
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
- `font-display: swap` через `<link>` препродашн уже настроен.

---

## 9. Verification before merge

Перед завершением задачи (или перед PR) **обязательно** — базовая проверка как в [`.cursorrules`](.cursorrules):

```bash
# 1. ESLint (включая jsx-a11y + no-restricted-syntax)
npm run lint
# → 0 errors. Warnings — допустимы только если документированы

# 2. Prettier
npm run format:check

# 3. Production build (= tsc -b && vite build)
npm run build
# → 0 TS errors; bundle не должен скакать >10% без причины

# 4. Grep design‑system violations
grep -rEon 'text-\[[0-9]+(px|rem)\]' src --include='*.tsx' | wc -l   # = allowlist count
grep -rEon 'bg-\[#[0-9a-fA-F]+\]' src --include='*.tsx' | wc -l      # = 0
grep -rEon 'z-\[[0-9]+\]' src --include='*.tsx' | wc -l              # = 0
grep -rEon 'rounded-\[[0-9]+(px|rem)\]' src --include='*.tsx' | wc -l # = allowlist count
grep -rE 'text-body-|text-meta|text-micro|text-title-|text-screen-title|text-display' src --include='*.tsx' | wc -l  # = 0
grep -rE 'surface-|shift-compact|bg-emp|drawer-surface|bg-terracotta|bg-accent|bg-role-|getRoleTheme' src --include='*.tsx' | wc -l  # = 0
# !important: 0 в JSX className (вне motion-reduce:)

# 5. Smoke check (preview)
npm run dev    # руками проверить ключевые экраны
```

Если меняется UI:

```bash
# 6. Visual regression
npm run test:visual          # после первого `npx playwright install chromium`
# или для пересохранения эталонов после намеренных изменений:
npm run test:visual:update
```

### Smoke screens — обязательный минимум для UI задач

| Экран | Что проверить |
|-------|---------------|
| Boot | Splash отрисовался, нет console errors |
| Onboarding (RoleSelector → TelegramConfirm → OnboardingComplete) | Прогресс‑бар, поля валидируются, Continue работает |
| Feed | Список, фильтры, hot offers, переключение jobs/shifts, пустое состояние |
| Activity | Tab Active/History, AddShiftDrawer открывается, валидация шагов |
| Profile | KPI, бейджи, edit drawer открывается per‑role, theme switch |
| Venue Suppliers | Поиск, фильтр drawer, пагинация, empty state |
| Dark / Light | Обе темы переключаются мгновенно, контраст ОК |

---

## 10. Output format (для AI‑ассистента)

После каждой задачи AI **обязан** дать summary в формате:

```markdown
## Что изменено

[1‑3 предложения о сути изменения.]

## Затронутые файлы

| Файл | Что |
|------|-----|
| `path/to/file.tsx` | краткое описание |

## Public API

- `useMyHook` — shape сохранён 1:1 / изменён (опишите как).
- `MyComponent` props — без изменений / новые props (опишите).

## Verification

- [x] `npm run lint` — 0 errors
- [x] `npm run format:check` — pass
- [x] `npm run build` (`tsc -b` + `vite build`) — 0 errors, bundle delta
- [x] Smoke check: [список проверенных экранов]
- [x] Visual regression — pass / N/A (если UI не менялся)

## Риски

1. [Риск 1, если есть.]
2. [Риск 2.]

## Что осталось на следующий этап

- [Если применимо.]
```

### Принципы AI‑output

- **Никаких неподтверждённых утверждений.** «Build passed» только если запустил.
- **Конкретика.** «Размер бандла +0.04 KB», а не «бандл практически не изменился».
- **Не скрывать warnings.** Если warning остался — он в summary.
- **Не предлагать «дальнейшие улучшения», которые не запрошены.** Только риски и
  блокеры.

---

## 11. Escalation rules

Если по ходу задачи:

- **Нужно нарушить дизайн‑систему** (новый цвет / размер / spacing вне scale) →
  не молча. Подними в summary, объясни причину, предложи альтернативу через
  расширение токенов.
- **Возникает refactor вне ТЗ** → перечисли в «Что осталось на следующий этап»,
  но **не делай** в текущем PR. Минимизируй blast radius.
- **Сломалась сборка / тесты** → не оставляй красные. Либо чини, либо откатывай
  изменения, которые сломали.
- **Тяжёлая зависимость / бизнес‑интеграция** (платежи, авторизация, Telegram
  Stars) → не реализуй на догадках. Документируй в `HANDOFF.md` что нужно от бэка.

---

## 12. Anti‑patterns reference

Краткий список того, что **никогда не должно** появляться:

```tsx
// ❌ Inline magic colors
className="bg-[#FF6B2C]"

// ❌ Arbitrary text size
className="text-[15px]"

// ❌ Arbitrary z-index
className="z-[200]"

// ❌ !important hack
className="!border-0 !ring-0 !shadow-none"

// ❌ Interactive div без a11y
<div onClick={handler}>{content}</div>

// ❌ Copy props to state via useEffect
useEffect(() => setLocalValue(propValue), [propValue])

// ❌ useMemo для примитива
const isActive = useMemo(() => count > 0, [count])

// ❌ Subscription без cleanup
useEffect(() => {
  document.addEventListener('click', handler)
}, [])

// ❌ Глобальный * { transition }
* { transition: all 0.3s ease }

// ❌ Card‑паттерн руками
<div className="rounded-xl border border-border bg-card p-4">…</div>

// ❌ Touch target <44px интерактивный
<button className="h-9 w-9">…</button>
```

И их корректные эквиваленты:

```tsx
// ✅
className="bg-primary"
className="text-sm"    // body в карточке; text-base — основной body
style={{ zIndex: Z_INDEX.alertDialog }}
<Input variant="inline" />

<button type="button" onClick={handler} aria-label="…">…</button>

const [localValue, setLocalValue] = useState(propValue)
useEffect(() => { ...controlled init with guard... }, [propValue])

const isActive = count > 0  // обычная переменная

useEffect(() => {
  document.addEventListener('click', handler)
  return () => document.removeEventListener('click', handler)
}, [])

body, .themed-surface { transition: background-color 0.2s ease }

<Card padding="md">…</Card>

<Button size="sm">…</Button>  // h-11 = 44px
```

---

## 13. Связанные документы

- [`.cursorrules`](.cursorrules) — канон (стек, Redux, структура).
- [`HANDOFF.md`](HANDOFF.md) — эндпоинты бэкенда (Stars, KPI, Hire, SOS, AI-match).
- [`AUDIT.md`](AUDIT.md) — engineering audit и roadmap.
- [`AGENTS.md`](AGENTS.md) — указатель на `.cursorrules`.

---

## 14. Контрольный чек‑лист (TL;DR)

Перед коммитом каждой задачи прогони мысленно:

- [ ] Цвета: Tailwind‑семантика (`bg-primary`, `bg-secondary`, `bg-elevated`, …), без legacy, без `bg-accent`, без `bg-role-*` / `getRoleTheme`.
- [ ] Типографика: константы `ui-patterns.ts` или шкала Tailwind; без `text-body-*` / `text-meta` и без ручных дублей заголовков.
- [ ] Радиусы: `rounded-sm` … `rounded-2xl`, без `shift-compact-*` CSS.
- [ ] Использую UI primitives, а не ad‑hoc div‑ы.
- [ ] Touch targets ≥ 44px на всех интерактивных элементах.
- [ ] safe‑area через утилиту, а не calc.
- [ ] z‑index через `Z_INDEX`.
- [ ] Все subscriptions / listeners имеют cleanup.
- [ ] Нет `useEffect` для derived state.
- [ ] Нет over‑memoization.
- [ ] Файлы не >300 LOC (или есть обоснование).
- [ ] Forms: validation pure, submission отдельно.
- [ ] aria‑label на icon buttons.
- [ ] focus‑visible state виден.
- [ ] `npm run lint` ✓
- [ ] `npm run format:check` ✓
- [ ] `npm run build` ✓ (`tsc -b` + `vite build`)
- [ ] Smoke check на mobile viewport.
- [ ] Output summary в формате §10.

Если хотя бы один пункт не выполнен — **не мерджить**.
