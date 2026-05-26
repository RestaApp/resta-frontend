/** Паттерны className для UI-примитивов — только токены Tailwind / CSS vars. */

export const TAG_BASE_CLASS =
  'inline-flex max-w-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors'

export const TAG_INACTIVE_CLASS =
  'border-transparent bg-secondary text-muted-foreground hover:bg-elevated hover:text-foreground'

export const TAG_ACTIVE_CLASS = 'border-transparent bg-primary text-primary-foreground'

export const TAG_DISABLED_CLASS = 'cursor-not-allowed opacity-50'

export const SEGMENTED_CONTAINER_CLASS = 'relative inline-flex rounded-sm bg-card p-1'

export const SEGMENTED_INDICATOR_CLASS = 'absolute bottom-1 top-1 rounded-sm bg-elevated'

export const SEGMENTED_TRIGGER_CLASS =
  'relative z-10 inline-flex min-h-8 items-center justify-center rounded-sm px-3 py-2 text-xs font-semibold transition-colors'

export const SEGMENTED_TRIGGER_ACTIVE_CLASS = 'text-primary-foreground'

export const SEGMENTED_TRIGGER_INACTIVE_CLASS = 'text-muted-foreground'

export const TAB_ACTIVE_INDICATOR_CLASS = 'shadow-sm bg-primary'

export const TAB_ACTIVE_TRIGGER_CLASS = 'text-primary-foreground'

// ─── Typography (Tailwind scale; базовые h1–h4 — в index.css @layer base) ───

/** Заголовок экрана — `h1`, табы, `PageHeader`, onboarding. */
export const SCREEN_TITLE_CLASS =
  'font-display text-2xl font-extrabold leading-none tracking-[-0.03em] truncate text-foreground'

/** Заголовок модалки / drawer / bottom sheet — `h2` в overlay. */
export const MODAL_TITLE_CLASS =
  'font-display text-xl font-semibold leading-tight tracking-tight text-foreground'

/** Акцентная цена / тариф (`text-xl`, extrabold). */
export const PRICE_EMPHASIS_CLASS =
  'font-display text-xl font-extrabold leading-tight tracking-tight text-foreground'

/** Hero / splash / крупный промо-заголовок (`text-4xl`). */
export const HERO_TITLE_CLASS =
  'font-display text-4xl font-extrabold leading-none tracking-tight text-foreground'

/** Заголовок секции — семантика `h2` (`text-lg`). */
export const SECTION_TITLE_CLASS = 'text-lg font-bold leading-snug tracking-tight text-foreground'

/** Заголовок блока карточки / профиля (`text-lg` semibold). */
export const BLOCK_TITLE_CLASS = 'text-lg font-semibold leading-tight text-foreground'

/** Подзаголовок с иконкой — семантика `h3` (`text-base`). */
export const SUBSECTION_TITLE_CLASS = 'text-base font-bold leading-snug text-foreground'

/** Крупная сумма на экране деталей (`text-2xl`). */
export const DISPLAY_PRICE_CLASS =
  'font-display text-2xl font-extrabold leading-none tracking-tight text-foreground'

/** Цена в компактной карточке смены (`text-lg`). */
export const CARD_PRICE_CLASS =
  'font-display text-lg font-extrabold leading-none tracking-tight text-foreground'

/** Значение KPI в строке. */
export const KPI_VALUE_CLASS = 'text-lg font-bold tracking-tight leading-none text-foreground'

/** Заголовок empty / success / error state. */
export const STATE_TITLE_CLASS = SECTION_TITLE_CLASS

/** Micro-лейбл секции (фильтры, формы). */
export const LABEL_CAPS_CLASS =
  'text-xs font-semibold uppercase tracking-wider text-muted-foreground'

/** Micro-заголовок секции профиля — как `Specialization`. */
export const PROFILE_SECTION_LABEL_CLASS =
  'font-mono-resta text-xs uppercase tracking-wide text-muted-foreground'

/** Mono-подпись (шаги, мета). */
export const META_MONO_CLASS =
  'font-mono-resta text-xs uppercase tracking-wider text-muted-foreground'

export const BODY_TEXT_CLASS = 'text-sm text-foreground'

export const BODY_MUTED_CLASS = 'text-sm text-muted-foreground'

/** @deprecated Используйте `SCREEN_TITLE_CLASS`. */
export const APP_HEADER_TITLE_CLASS = SCREEN_TITLE_CLASS

export const APP_HEADER_ACTION_BUTTON_CLASS =
  'h-12 w-12 min-w-12 rounded-sm p-0 flex-shrink-0 bg-transparent text-foreground hover:bg-transparent hover:text-foreground'

export const APP_HEADER_ACTION_ICON_CLASS = 'h-6 w-6'

export const INPUT_FIELD_BASE_CLASS =
  'w-full min-w-0 rounded-lg border border-border bg-input-background text-foreground caret-foreground'

export const INPUT_FIELD_INTERACTIVE_CLASS =
  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20'

export const INPUT_FIELD_INVALID_CLASS =
  'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20'

export const INPUT_FIELD_DISABLED_CLASS =
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

export const DRAWER_BODY_CLASS = 'ui-density-page ui-density-py ui-density-stack'

export const DRAWER_HEADER_CLASS = 'border-b border-border/50 ui-density-page'

export const DRAWER_SCROLL_BODY_CLASS =
  'flex-1 min-h-0 overflow-y-auto ui-density-page ui-density-py'

export const DRAWER_FOOTER_CLASS =
  'border-t border-border/50 bg-background ui-density-page ui-density-py-sm'

export const DRAWER_SETTING_ROW_CLASS =
  'flex items-center justify-between gap-3 rounded-lg border border-border/50 p-4'

export const SHADOW_MODAL_CLASS = 'shadow-[var(--shadow-modal)]'

export const MODAL_SURFACE_CLASS = `w-full rounded-2xl border border-border bg-card ${SHADOW_MODAL_CLASS}`
