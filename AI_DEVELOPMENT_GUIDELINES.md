# AI_DEVELOPMENT_GUIDELINES.md

> **Internal engineering standard для Resta — Telegram Mini App.**
> Применяется к любым изменениям: redesign, фичи, рефакторинг.
> Документ — обязателен к прочтению AI‑ассистенту и любому контрибьютору
> перед коммитом. При расхождении с `.cursorrules` приоритетен `.cursorrules`.

---

## 0. Принципы

1. **Stability over novelty.** Перед добавлением — проверь, есть ли уже примитив/токен. Дублирование UI = технический долг.
2. **Один источник истины.** Дизайн‑токены, z‑index, typography, safe‑area —
   живут в одном месте (`src/index.css`, `src/shared/ui/zIndex.ts`).
3. **Production‑first.** Любое изменение должно проходить TS + ESLint + build
   без warnings. Локальные `eslint-disable` — только с пояснительным комментарием.
4. **SRP и композиция.** Файл >300 LOC — повод задуматься о расщеплении.
5. **Не делать рискованных рефакторингов без явной пользы.** Минимизируй blast radius.

---

## 1. UI / UX consistency

### 1.1. Используй существующие design tokens

Все цвета, фон, текст, surface — через CSS‑переменные из [`src/index.css`](src/index.css):

```ts
// ✅ хорошо
className="bg-card text-foreground border-border"
className="text-success bg-success/10"

// ❌ запрещено
className="bg-[#141418] text-[#F5F5F7]"          // hardcode
className="bg-card-secondary"                     // несуществующий токен
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
| Карточка‑surface | [`Card`](src/components/ui/card.tsx) с `padding`/`emphasis`/`accent` |
| Информационный блок (success/warning/info) | [`Callout`](src/components/ui/callout.tsx) |
| KPI блок (значение + подпись) | [`KpiRow`](src/components/ui/kpi-row.tsx) |
| Bottom sheet | [`Drawer`](src/components/ui/drawer.tsx) |
| Modal | [`Modal`](src/components/ui/modal.tsx) |
| Confirmation | [`AlertDialog`](src/components/ui/alert-dialog.tsx) |
| Toast | [`useToast`](src/hooks/useToast.ts) |
| Lazy fallback | [`PageSuspense`](src/components/ui/PageSuspense.tsx) |
| Бейдж | [`Badge`](src/components/ui/badge.tsx) (variants: `sos/verified/direct/boost/pro/stars/...`) |

### 1.5. Не создавай ad‑hoc UI без причины

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
| `text-[Npx]` (вне allowlist 9/16/36/52) | `text-micro` (10) / `text-meta` (11) / `text-body-sm` (12) / `text-body-md` (13) / `text-body-lg` (14) / `text-title-sm` (16) / `text-title-md` (18) / `text-display` (24) / `text-display-lg` (34) |
| `bg-[#hex]` | `bg-primary` / `bg-card` / `bg-success/10` / `bg-[image:var(--gradient-stars)]` |
| `z-[N]` | `style={{ zIndex: Z_INDEX.modal }}` (см. [`src/shared/ui/zIndex.ts`](src/shared/ui/zIndex.ts)) |
| `!important` (вне `motion-reduce:`) | Расширь API примитива через `variant` |
| `rounded-[Npx]` (вне allowlist 4px/2rem) | `rounded-md` (12) / `rounded-lg` (14) / `rounded-xl` (16) / `rounded-2xl` (20) |

### 2.2. Typography scale (single source)

```css
/* @theme inline в src/index.css */
--text-micro: 10px       /* badges, micro labels */
--text-meta: 11px        /* secondary metadata, JetBrains Mono labels */
--text-body-sm: 12px     /* compact body */
--text-body-md: 13px     /* default body in cards */
--text-body-lg: 14px     /* default page body */
--text-title-sm: 16px    /* card titles */
--text-title-md: 18px    /* section headers */
--text-display: 24px     /* page hero */
--text-display-lg: 34px  /* splash hero */
```

**Не вводить новые размеры** без обсуждения. Старайся использовать ближайший
существующий токен.

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

Не плодить ручные `pb-[calc(1rem+env(...))]` — используй утилиту.

### 2.5. Semantic tokens вместо raw values

```tsx
// ❌
'bg-[rgba(62,201,126,0.1)] border-[rgba(62,201,126,0.4)]'

// ✅
'bg-success/10 border-success/40'
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

Перед завершением задачи (или перед PR) **обязательно**:

```bash
# 1. TypeScript
npx tsc -b
# → должно быть 0 errors

# 2. ESLint (включая prettier + jsx-a11y + no-restricted-syntax)
npm run lint
# → 0 errors. Warnings — допустимы только если документированы

# 3. Production build
npm run build
# → built in <3s, размер chunks не должен скакать >10% без причины

# 4. Grep design‑system violations
grep -rEon 'text-\[[0-9]+(px|rem)\]' src --include='*.tsx' | wc -l   # = allowlist count
grep -rEon 'bg-\[#[0-9a-fA-F]+\]' src --include='*.tsx' | wc -l      # = 0
grep -rEon 'z-\[[0-9]+\]' src --include='*.tsx' | wc -l              # = 0
grep -rEon 'rounded-\[[0-9]+(px|rem)\]' src --include='*.tsx' | wc -l # = allowlist count
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

- [x] `tsc -b` — 0 errors
- [x] `eslint .` — 0 errors, N warnings (если есть — список)
- [x] `vite build` — N.NNs, bundle delta
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
className="text-base"  // или text-body-lg
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

- [`.cursorrules`](.cursorrules) — продуктовые конвенции (стек, структура, типы).
- [`AUDIT.md`](AUDIT.md) — последний engineering audit с roadmap'ом.
- [`HANDOFF.md`](HANDOFF.md) — что нужно от бэка для активации фич.
- [`AGENTS.md`](AGENTS.md) — указатель на `.cursorrules`.

---

## 14. Контрольный чек‑лист (TL;DR)

Перед коммитом каждой задачи прогони мысленно:

- [ ] Использую только design tokens (typography / colors / radius / spacing).
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
- [ ] `tsc -b` ✓
- [ ] `npm run lint` ✓ (0 errors)
- [ ] `npm run build` ✓
- [ ] Smoke check на mobile viewport.
- [ ] Output summary в формате §10.

Если хотя бы один пункт не выполнен — **не мерджить**.
