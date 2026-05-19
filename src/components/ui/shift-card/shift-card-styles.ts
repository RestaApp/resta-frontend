/** Общие Tailwind-классы компактной карточки смены / поставщика. */

import { CARD_PRICE_CLASS } from '@/components/ui/ui-patterns'

export const SHIFT_CARD_CLASS = 'rounded-lg border border-border bg-card p-3'

export const SHIFT_CARD_INTERACTIVE_CLASS =
  'group cursor-pointer outline-none transition-all duration-200 active:scale-[0.99] hover:border-border/80 focus-visible:ring-2 focus-visible:ring-ring'

export const SHIFT_CARD_SOS_CLASS = 'border-primary/40 bg-gradient-to-br from-primary/15 to-card'

export const SHIFT_CARD_ROW_CLASS = 'flex items-start justify-between gap-2'

export const SHIFT_CARD_BADGE_ROW_CLASS = '-mt-1.5 mb-1.5'

export const SHIFT_CARD_BADGE_CLASS =
  'inline-flex items-center gap-0.5 rounded-sm bg-primary px-1.5 py-0.5 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground'

export const SHIFT_CARD_LOGO_CLASS =
  'grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-primary text-sm font-extrabold leading-none text-primary-foreground'

export const SHIFT_CARD_TITLE_CLASS = 'text-sm font-semibold leading-snug text-foreground'

export const SHIFT_CARD_SUB_CLASS = 'truncate text-xs leading-snug text-muted-foreground'

export const SHIFT_CARD_PRICE_CLASS = CARD_PRICE_CLASS

export const SHIFT_CARD_CURRENCY_CLASS =
  'ml-0.5 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground'

export const SHIFT_CARD_META_CLASS =
  'flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-xs tracking-wide text-muted-foreground'
