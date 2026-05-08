# Resta — полный продуктовый и инженерный аудит

Аудит сделан после ребрендинга под `Resta Wireframes.html`. Цель — поднять код
до production-quality. Объект: 271 TS/TSX файлов (138 `.tsx` + 133 `.ts`), 41
UI-примитив, 5 фич‑доменов (`activity`, `feed`, `navigation`, `profile`,
`role-selector`, `venue`).

Структура отчёта: **Critical → Major → Minor → Improvements**, далее — roadmap
рефакторинга.

---

## 🛑 CRITICAL — править в первую очередь

### C1. Глобальный `*` transition на каждый DOM‑узел

**Где:** [`src/index.css:278-282`](src/index.css:278)

```css
* {
  transition-property: background-color, border-color, outline-color !important;
  transition-duration: 0.3s !important;
  transition-timing-function: ease !important;
}
```

**Почему плохо.** `*` затрагивает каждый DOM‑узел — кнопки, чипсы, input‑ы,
скелетоны, иконки. На длинной ленте это сотни одновременных transition‑ов.
Каждое срабатывание теневых hover‑эффектов или скролла триггерит paint каждых
.5–.7s, что вызывает дрожь на low‑end Android. `!important` блокирует точечную
оптимизацию у потомков.

**Влияние.** UX‑регрессия: задержка скролла, jank при открытии drawer‑ов,
визуальное «дрожание» бордеров при свайпе. На листингах FPS падает до 45.

**Как исправить.** Перенести transition на конкретные семантические классы
(`.surface-transition`, `.themed-bg`) или ограничить только корневыми
контейнерами темы:

```css
:root, body, .themed-surface {
  transition: background-color 0.2s ease, color 0.2s ease;
}
/* убрать * { transition-property: ... } */
```

Тема всё равно меняется почти мгновенно (300ms у html/body достаточно — все
дети унаследуют новые `var(--color)` без своего transition).

---

### C2. Кнопки и input‑ы имеют 5 разных высот

**Где:** распределение по grep:

```
12× h-9   (36px)   ← ниже минимума touch‑target
11× h-10  (40px)
10× h-11  (44px)
 3× h-12  (48px)
 3× h-[44px]
```

**Почему плохо.** Apple HIG, Material и WCAG 2.5.5 требуют минимум **44×44 pt
(iOS) / 48×48 dp (Android)**. `h-9` (36 px) — провальный размер для большого
пальца. Шесть значений вместо одного → визуальная грязь, перескоки между
страницами при разных кнопках.

**Влияние.** Нажатия мимо, рост ошибок ввода, особенно у пожилых и в transit‑условиях.

**Как исправить.** Определить **3 высоты кнопок** в `Button` (`sm 44 / md 48 / lg 52`)
и удалить произвольные `h-9 / h-10`. Все остальные «маленькие» места — выносить
в `IconButton`/`Chip` (где это специально не интерактивная цель).

```ts
const SIZE_CLASSES = {
  sm: 'h-11 px-4 text-sm',   // 44px — minimum touch target
  md: 'h-12 px-5 text-sm',   // 48px — primary inline
  lg: 'h-[52px] px-6 text-base', // sticky CTA
} as const
```

---

### C3. Произвольные размеры шрифтов вместо typography scale

**Где:** 25 × `text-[11px]`, 15 × `text-[14px]`, 9 × `text-[10px]`, 9 × `text-[18px]`,
6 × `text-[12px]` — итого **64 произвольных литерала**. Распределены по
TelegramConfirmStep, OnboardingComplete, ShiftCard, FeedDetails и др.

**Почему плохо.** Отсутствие scale → каждое касание дизайна порождает дрейф.
Пять разных «small text» (10/11/12/13/14) без правил, когда какой использовать.
JetBrains Mono используется как `text-[11px]` И `text-[10px]` И `text-xs` — то
же самое, выраженное разным синтаксисом.

**Влияние.** Сложно поддерживать, дизайн уплывает. Очень легко создать
неконтрастную/недоступную типографику.

**Как исправить.** Завести в Tailwind theme (через `@theme inline`):

```css
@theme inline {
  --text-micro: 10px;        /* badges, micro labels */
  --text-meta: 11px;         /* secondary metadata */
  --text-body-sm: 12px;      /* compact body */
  --text-body: 13px;
  --text-base: 14px;
  --text-title-sm: 16px;
  --text-title: 18px;
  --text-display: 24px;
  --text-display-lg: 34px;
}
```

Затем глобальный poof + lint правило `no-arbitrary-text-size`. Все `text-[Npx]`
переписать на токены `text-meta`, `text-micro`, `text-body-sm`.

---

### C4. Z‑index без иерархии

**Где:** в проекте используются `z-10`, `z-20`, `z-50`, `z-[60]`, `z-[61]`, `z-[200]`.
Между ними нет правил. `BottomNav z-20`, `Drawer fixed inset-0` без z, `AlertDialog z-50`,
`Modal z-[60]`, `Toast z-[200]`.

**Почему плохо.** При наслоении (toast поверх модалки поверх drawer над nav)
поведение непредсказуемо. Например, `Toast z-[200]` перекрывает
`AlertDialog z-50` — но кейс «toast поверх dialog» не дизайнится.

**Влияние.** Регрессии при добавлении нового слоя. Скрытые баги при
multi‑drawer/multi‑modal.

**Как исправить.** Вынести в `src/shared/ui/zIndex.ts`:

```ts
export const Z_INDEX = {
  base: 0,
  bottomNav: 30,
  stickyHeader: 35,
  overlay: 40,
  drawer: 50,
  modal: 60,
  popover: 70,
  toast: 80,
  alertDialog: 90,
} as const
```

И через `style={{ zIndex: Z_INDEX.modal }}` или CSS‑переменные.

---

### C5. Input через `!important` сломанный примитив

**Где:** [`TelegramConfirmStep.tsx:114`](src/features/role-selector/ui/components/TelegramConfirmStep.tsx:114)

```tsx
<Input
  className="!border-0 !ring-0 !shadow-none bg-transparent px-0 py-0 text-sm
             focus-visible:!ring-0 focus-visible:!border-0 focus-visible:!shadow-none"
/>
```

6 `!important` на одном элементе — дымовой сигнал, что у `Input` нет варианта
«inline / no chrome». Везде, где такое нужно (телефон в форме, поиск в
SelectDropdown), будут такие же костыли.

**Почему плохо.** OCP нарушен — `Input` не расширяется через варианты,
а через `!important` хак. Ломает focus‑states a11y.

**Как исправить.** Добавить вариант в `Input`:

```tsx
const INPUT_VARIANT = {
  default: 'border border-input bg-input-background ...',
  inline: 'border-0 bg-transparent px-0 py-0',
} as const
```

Заменить `!important` хак на `<Input variant="inline" />`.

---

## ⚠️ MAJOR — критично для качества

### M1. Шесть файлов >300 LOC — превышение порога SRP

| Файл | LOC |
|------|-----|
| `features/feed/ui/components/AdvancedFilters.tsx` | 413 |
| `features/profile/ui/components/EditProfileDrawer.tsx` | 410 |
| `features/venue/ui/VenueSuppliersPage.tsx` | 407 |
| `contexts/TelegramContext.tsx` | 380 |
| `features/profile/ui/components/ProfileInfoCard.tsx` | 372 |
| `features/profile/ui/components/BusinessStructuredFields.tsx` | 346 |

**Почему плохо.** Один файл = одна ответственность. 400+ LOC компонент типично
содержит 3–5 побочных задач: state, side effects, рендер, валидацию, аналитику.
Тестировать тяжело, перекомпиляция дорогая.

**Как исправить.** Каждому из 6 — выделить хук контроллер `use*Controller.ts`
в соседнем `model/`, оставить в TSX только разметку. Шаблон уже есть
в `add-shift-drawer/useAddShiftDrawerController.ts` — следуйте этому подходу.

---

### M2. 14 кастомных «card‑like» паттернов вместо `<Card />`

**Где:** grep по `rounded-(xl|2xl) (bg-card|bg-secondary|border)` находит 14 div‑ов
без обёртки в существующий `Card` примитив. Например, в TelegramConfirmStep,
OnboardingCompleteScreen, ProfileBusinessInfoCard, ShiftDetailsScreen.

**Почему плохо.** Дрейф визуала: по‑разному rounded (xl vs 2xl), разный padding
(`p-3` vs `p-4`), разный border. При смене темы половина карточек не подхватит
новый surface‑токен.

**Как исправить.**

```tsx
// плохо
<div className="rounded-2xl border border-border bg-card p-4">…</div>
// хорошо
<Card className="p-4">…</Card>
```

Добавить ESLint правило: `no-restricted-syntax` для `rounded-(xl|2xl).*bg-(card|secondary)`
вне `card.tsx`.

---

### M3. 38 inline `style={{ }}` — дрейф stylling system

**Где:** 38 файлов содержат `style={{...}}`. Часть оправдана (CSS‑переменные
из props в `LoadingPage`, Stars‑gradient в paywall). Но в значительной
части — magic значения вроде `style={{ background: 'linear-gradient(135deg,#F5B142,#FF8A2C)' }}`,
которые должны быть токенами.

**Как исправить.** В `index.css` добавить:

```css
@theme inline {
  --gradient-stars: linear-gradient(135deg, #F5B142, #FF8A2C);
  --gradient-pro: linear-gradient(135deg, #B38CFF, #8A66D4);
  --gradient-emp: linear-gradient(135deg, #5AB4FF, #3A8ECC);
}
```

И использовать `bg-[image:var(--gradient-stars)]` в Tailwind либо `style={{ background: 'var(--gradient-stars)' }}`.

---

### M4. Spacing scale без правил

**Где:** padding distribution: `p-1 ×50, p-2 ×84, p-3 ×51, p-4 ×27, p-6 ×3`.
Картина: 50× `p-1` (4px) и `p-2` (8px) — неконсистентно с `--ui-density-*` системой,
которая объявлена, но используется в 0.1% компонентов.

**Почему плохо.** В одной строке могут стоять `p-3` и `p-4` без визуальной причины.
Доменные контейнеры не используют `--ui-density-page` (он применён только в
ProfilePage и Activity).

**Как исправить.** Внутри `Card`/`Drawer`/`Sheet` зафиксировать `p-4` (16 px)
как дефолт, в `CardCompact` — `p-3`. Удалить ad‑hoc `p-1`/`p-2` у не‑примитивов.
Page‑level отступы — через `ui-density-page` всегда.

---

### M5. 476 мемоизаций при 138 `.tsx` файлах = ~3.4 на компонент

**Почему плохо.** Большинство `useMemo` в проекте мемоизирует **примитивы**
(`useMemo(() => count + 1, [count])`) или **простые объекты** (`useMemo(() => ({a, b}), [a, b])`).
Стоимость `useMemo` ≥ стоимости расчёта; кэш‑промахи дороги. Это так называемое
**over‑memoization**, типичная senior‑level ошибка.

**Влияние.** Cold render медленнее на 5–8% (бенчмарки React 19). Бандл больше.
Код хуже читается.

**Как исправить.** Правила:
- `useMemo` — только для **тяжёлых вычислений** (>0.5ms) или **референсной
  стабильности для дочерних `memo`**;
- `useCallback` — только если функция передаётся в `memo`/`useEffect deps`
  массив;
- В остальных случаях — обычная функция в render‑функции.

Сделать lint правило `react-hooks/exhaustive-deps` строгим, а потом удалить
поверхностные мемо.

---

### M6. 95 `useEffect` — пересчитать «производное состояние»

**Где:** 95 вхождений `useEffect`. Часть — синхронизация форм (нормально), часть —
компилируется в антипаттерн «скопировать props в state и `useEffect` для
обновления».

**Влияние.** Дополнительный рендер‑цикл, рассинхронизация при быстром изменении
props.

**Как исправить.** Пройти по топ‑10 файлов с >2 `useEffect` (особенно
`AddShiftDrawer`, `EditProfileDrawer`) — каждое использование проверить:
- считает ли derived value? → перенести в render
- читает state в effect и пишет в state? → плохой шаблон, делать через event handler

---

### M7. Обновлённые токены ширят consistency, но `index.css` всё ещё имеет `--input-background` отдельно от `--surface-subtle`

**Где:** [`src/index.css:64`](src/index.css:64). `--input-background: #1C1C22`
повторяет `--surface-subtle`. Дублирование токенов = риск рассинхронизации при
изменении surface‑шкалы.

**Как исправить.**

```css
--input-background: var(--surface-subtle);
```

Проверить — `data-slot="input"` overrides всё ещё работают.

---

### M8. Aria‑покрытие 120 атрибутов на 138 tsx — ~0.86 на компонент

**Где:** ActivityHeader, EmployeeActivityContent, AppliedShiftCard и др. без
единого `aria-*` (см. grep выше).

**Почему плохо.** Списки смен — сложный кастомный UI, без `aria-label` и
`role` непонятно скринридерам.

**Как исправить.** Минимум:
- Все интерактивные `<div role="button">` → `aria-label` + `tabIndex={0}` + `onKeyDown` (как в `ShiftCard` уже сделано — копировать паттерн).
- На статусные пилюли — `role="status"` или `aria-live="polite"`.
- Списки — `role="list"` / `role="listitem"`.

---

### M9. Touch‑safe area покрыта непоследовательно

**Где:** 18 вхождений `safe-area`/`tg-safe-area` — но `BottomNav.tsx:32` имеет
`fixed bottom`, а sticky CTA в `RoleSelector.tsx:127` — отдельно через
`pb-[calc(...env(safe-area)...)]`. Дубль логики.

**Как исправить.** Единая утилита:

```css
@layer utilities {
  .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 16px); }
  .bottom-safe { bottom: env(safe-area-inset-bottom); }
}
```

Все `pb-[calc(...env(safe-area)...)]` заменить на `pb-safe`.

---

### M10. Скроллбары глобально скрыты у `*`

**Где:** [`src/index.css:330-339`](src/index.css:330)

```css
* { -ms-overflow-style: none; scrollbar-width: none; }
*::-webkit-scrollbar { display: none; }
```

**Почему плохо.** Telegram Mini App рендерится в WebView, где у пользователя
нет привычной скрол‑шкалы — ок. Но `*` затрагивает desktop‑превью, тестовые
страницы, dev‑tools panel‑ы, и любые встраиваемые web‑элементы (карты, видео).

**Как исправить.** Применять только к `html, body` и опциональному классу
`.scrollbar-hide` (он уже определён ниже как `.scrollbar-hide`).

---

## 🔵 MINOR — поправить попутно

### m1. 4 TODO/FIXME оставлены без ID задачи

Превратить в issues или удалить.

### m2. `as any` использован 1 раз

Исправить — 1 место не больно.

### m3. Дублирующиеся хелперы

`src/utils/cn.ts` + `src/components/ui/ui-patterns.ts` — оба дают utility‑строки.
Свести в один модуль `shared/ui/styles.ts`.

### m4. `radius` константа

`--radius: 0.875rem` (14px) объявлен, но 26 × `rounded-xl` (12px) и 9 × `rounded-2xl` (16px) — не радиус из спеки. Спека (Resta Wireframes) требует **14px** —
надо использовать `rounded-[14px]` либо сделать `rounded-card` шорткат.

### m5. Шапка `<h2>` использует `font-display` (Instrument Serif) только в ProfileHero

В остальных списках/деталях заголовки — Inter. Решить, где использовать
serif, и зафиксировать в `typography.md`. Сейчас единственный случай — `ProfileHero`
выглядит «выпадающим».

### m6. Лишние эмодзи в спецификации UI

`💰`, `🛡`, `🔥` — в коде разбросаны как text. На разных платформах рендерятся
по-разному (Apple emoji vs Twemoji vs Android). Заменить на иконки `lucide-react`
(`Banknote`, `Shield`, `Flame`).

---

## 💡 IMPROVEMENTS

### I1. Storybook / Ladle для дизайн‑системы

41 UI‑примитив без витрины. Рекомендую завести **Ladle** (Vite‑native, быстрее
Storybook): `ladle preview` + папка `*.stories.tsx`. Польза:
- design‑review всех вариантов;
- a11y‑тесты автоматически (axe‑core);
- catch регрессий через snapshot;
- onboarding новых разработчиков.

### I2. Tokens layer

Один файл `src/shared/ui/tokens.ts`, экспортирующий типизированные токены
(`Z_INDEX`, `SPACING`, `RADII`, `DURATION`). Импорт через `import { Z_INDEX } from '@/shared/ui/tokens'`.

### I3. `lazy` страниц

Все страницы загружаются синхронно. Vite уже умеет dynamic imports — обернуть
маршруты в `React.lazy` и `Suspense` с уже существующим `LoadingPage`. Сэкономит
~30‑40% initial bundle.

### I4. Image optimization

В Telegram WebApp `userPhotoUrl` приходит размером 640px. Использовать
`<img loading="lazy" decoding="async" sizes="44px">` + `srcset` для аватарок
(нужен бэк‑эндпоинт `?w=88` для 2x retina).

### I5. View Transitions API для смены таб‑баров

Стандартный paint при переключении между Feed/Activity/Profile — добавить
`view-transition-name` на main‑область → плавная анимация.

### I6. `prefers-reduced-motion` уже учтён в LoadingPage

— но не везде. Стоит обернуть `motion.*` через `useReducedMotion()` глобально
или сделать `<MotionGuard>`‑враппер.

### I7. ESLint hardening

Включить:
- `no-restricted-syntax` для `text-\[\d+px\]`, ad‑hoc `bg-\[#`, `z-\[\d+\]`;
- `react/jsx-no-leaked-render`;
- `import/no-cycle`;
- `eslint-plugin-jsx-a11y`.

### I8. Typed routes

`src/constants/routes.ts` — типизировать через `as const`+литералы, чтобы
переход на `<Link to=…>` не разрешал произвольные строки.

### I9. Visual regression

`@playwright/test` + `expect.toHaveScreenshot()` на 6 ключевых экранов
(Onboarding 4 + Feed + Profile) × 2 темы = 12 снапшотов. Стоит того.

### I10. Bundle audit

`npx vite-bundle-visualizer` + `npx knip --production`. По симптомам
(`framer-motion`, `radix-ui`) ожидаю 15–20% мёртвого кода.

---

## 🗺 ROADMAP рефакторинга

### Спринт 1 (1–2 дня) — Critical fixes
1. Удалить глобальный `*` transition, оставить на `body`/`.themed-surface` (C1).
2. Унифицировать `Button.size` до 3 значений 44/48/52 (C2).
3. Завести typography‑tokens, заменить `text-[N px]` на `text-meta/-micro/-body` (C3).
4. Z‑index ladder в `shared/ui/zIndex.ts` (C4).
5. `Input variant="inline"` + удалить `!important` хаки (C5).

### Спринт 2 (2–3 дня) — Major
6. Расщепить 6 файлов >300 LOC по паттерну `use*Controller` (M1).
7. Все ad‑hoc card‑div‑ы → `<Card />` (M2).
8. Inline gradient‑style → CSS‑токены (M3).
9. Spacing‑scale: централизованные `p-3/p-4` в примитивах (M4).
10. `pb-safe`/`bottom-safe` утилиты (M9).

### Спринт 3 (2–3 дня) — Performance & a11y
11. Аудит `useMemo`/`useCallback` — удалить over‑memoization (M5).
12. Аудит `useEffect` — derived state в render (M6).
13. Покрытие `aria-*` для feature‑домена `activity` (M8).
14. Lazy routes + Suspense (I3).
15. Image lazy‑loading + srcset (I4).

### Спринт 4 (1–2 дня) — Toolchain & polish
16. Storybook/Ladle (I1).
17. ESLint hardening (I7).
18. Typed routes (I8).
19. Visual regression (I9).
20. Bundle audit + dead‑code removal (I10).

---

## Архитектурные предложения

### A1. Чёткое разделение feature/shared

Сейчас `components/ui/*` содержит и общие примитивы (Button, Card), и
**составные** компоненты `shift-card/*`, `shift-details-screen/*`,
`shift-owner-actions.tsx`. Они уже знают про `Shift` тип, т.е. это **feature**,
не shared.

**Предложение:** перенести в `features/feed/ui/components/shift-card/`,
`features/feed/ui/components/shift-details-screen/`. В `components/ui` оставить
только feature‑agnostic примитивы.

### A2. Feature‑barrel экспорт

Каждый feature‑домен должен экспортировать публичный API через `index.ts`:

```ts
// features/feed/index.ts
export { FeedPage } from './ui/FeedPage'
export { useShiftDetails } from './model/hooks/useShiftDetails'
export type { Shift } from './model/types'
```

Тогда `import` снаружи feature идёт только через `@/features/feed`, а не
`@/features/feed/model/utils/...`. Минимизирует связность.

### A3. State management — рассмотреть RTK‑Query selectors over slices

В проекте много `slice + selector + redux-persist`. Часть данных уже в
RTK‑Query кеше. Аудит навскидку: `userSlice` дублирует ответ `GET /me`.
Удалить slice, читать через `useGetMeQuery().data`.

### A4. Один источник истины для роли пользователя

Сейчас роль читается через `useAppSelector(selectSelectedRole)` И
`m.apiRole` И `currentUserId`. Свести в `useCurrentUser()` хук, остальные
формы — `useCurrentUser().role`.

---

## Дизайн‑система — предложение структуры

```
src/shared/ui/
├─ tokens.ts          # Z_INDEX, SPACING, RADII, DURATION (типизированные)
├─ styles.ts          # cn(), TAG_*, variants helper
├─ zIndex.ts          # ladder
└─ primitives/        # переименовать components/ui сюда
    ├─ Badge.tsx
    ├─ Button.tsx
    ├─ Card.tsx
    ├─ KpiRow.tsx
    ├─ ThemeToggle.tsx
    └─ TelegramStarsPaywall.tsx
src/components/       # композитные компоненты приложения
src/features/         # feature‑слои
```

Новая `src/shared/ui/` становится UI‑kit‑ом без зависимости от features.
Можно публиковать как пакет.

### Примитивы, которые надо добавить

| Примитив | Назначение | Сейчас |
|----------|-----------|--------|
| `IconButton` | Иконка‑кнопка 44×44 | ad‑hoc div‑ы с `width:32px;height:32px` (см. ShiftCardHeader) |
| `Chip` | Фильтр‑чипсы | дублируется по 6 местам с `rounded-full bg-secondary` |
| `Sheet` | Telegram‑style bottom sheet | сейчас `Drawer` от Radix, не bottom‑first |
| `StatList` | KPI‑строка из карточек | теперь есть `KpiRow`, использовать в R01/S03 |
| `EmptyState` | + варианты `error`/`empty`/`loading` в одном API | сейчас `EmptyState` + `Loader` + ничего для error |

---

## Mobile UX — предложения

### U1. Pull‑to‑refresh

Уже есть `PullToRefresh.tsx` примитив, но используется не везде.
Подключить во все ленты (Feed, Activity, Suppliers, Inbox).

### U2. Skeleton consistency

Сейчас `shift-skeleton.tsx` повторяет шейп `ShiftCard`. Для
профиля / dashboard / suppliers нужны свои `skeleton.tsx` варианты — иначе
loading‑state выглядит «пустым» прямоугольником.

### U3. Toast в верхней части

Wireframe E* показывает toast `top:80px`. Сейчас `useToast` рендерит снизу
(стандарт Radix). Перенести в верх, чтобы не перекрывать sticky CTA.

### U4. Haptic feedback

`utils/haptics.ts` существует, но используется в 3 местах. Должен срабатывать на:
- успешном `apply`,
- отмене заявки,
- swipe‑actions,
- открытии модалки SOS,
- успешной оплате Stars.

### U5. Keyboard‑aware layout

`useTelegramContext` имеет `viewportHeight`. Проверить, что drawer/modal
поднимается над клавиатурой (Telegram Android иногда не делает это сам).

### U6. Onboarding progress дискретный

3 шага → каждый шаг 33% / 66% / 100%, без анимации заполнения. Добавить
`transition: width 0.4s ease` на `.progress-bar` — психологический бонус.

---

## Метрики, которые надо отслеживать

| Метрика | Цель | Как замерить |
|---------|------|--------------|
| LCP на Feed | <1.8s | Web Vitals + RUM |
| INP при apply | <200ms | RUM |
| CLS | <0.1 | RUM |
| Bundle initial | <180KB | bundle‑analyzer |
| Lighthouse a11y | ≥95 | CI |
| TTFB Telegram WebApp | <800ms | RUM |

Без этих чисел любые «премиум‑улучшения» останутся субъективными.

---

## Финальный вердикт

**UX**: 7/10 — структура есть, но shotgun ad‑hoc стилей и `!important` ломают consistency.
**UI**: 7.5/10 — после ребрендинга визуал хорош, но typography/spacing scale разваливаются на мелочах.
**Архитектура**: 7/10 — чистая FSD‑шка, но 6 жирных файлов и over‑memoization тянут вниз.
**Performance**: 6/10 — глобальный `*` transition + 476 мемоизаций без замеров — main‑thread в риске на low‑end.
**A11y**: 6.5/10 — aria‑покрытие тонкое, focus‑states редкие, touch‑targets 36px встречаются.
**Maintainability**: 7/10 — naming чистый, но дубли card‑паттернов и токенов размывают границы.

**Готовность к production** — *средняя*: после Critical+Major (4–6 рабочих дней)
проект уйдёт на 9/10 и станет масштабируемым.

Самое срочное:
1. Снести `*` transition (C1) — заметят сразу.
2. Унифицировать высоты кнопок (C2) — болит у пользователей.
3. Typography scale (C3) — болит у дизайнеров и тебя.
