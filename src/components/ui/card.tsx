import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/utils/cn'

/**
 * Card — единственный примитив поверхности приложения.
 *
 *  • `padding="md"` (default, 16px) — для основной массы карточек: списки, формы,
 *    KPI‑блоки, баннеры. Соответствует радиусу 14 px из `Resta Wireframes` спеки.
 *  • `padding="sm"` (12px) — для компактных списков (кандидаты, мини‑превью).
 *  • `padding="none"` — если внутри собственная сетка с edge‑to‑edge изображением
 *    или вложенные секции с собственным паддингом.
 *
 * Все ad‑hoc `rounded-xl bg-card border` div‑ы должны мигрировать на `<Card />`.
 */
const BASE_CARD = 'rounded-lg border border-border bg-card transition-colors'

const PADDING_CLASSES = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
} as const

export type CardPadding = keyof typeof PADDING_CLASSES

export type CardProps = {
  padding?: CardPadding
  /** Подсветить как highlighted (более тёмный surface, как E04 hl). Alias: elevated. */
  emphasis?: boolean
  /** Статусная метка — граница слева. `sos` = primary для срочных смен. */
  status?: 'success' | 'warning' | 'destructive' | 'primary' | 'sos'
  /** Выбранное состояние (Role/Format/Specialization селекторы): primary border + soft fill. */
  selected?: boolean
  /** PRO-карта: фиолетовый gradient border + лёгкая подложка (BOARD 09). */
  pro?: boolean
} & ComponentPropsWithoutRef<'div'>

const STATUS_BORDER: Record<NonNullable<NonNullable<CardProps['status']>>, string> = {
  primary: 'border-l-2 border-l-primary',
  sos: 'border-l-2 border-l-primary',
  success: 'border-l-2 border-l-success',
  warning: 'border-l-2 border-l-warning',
  destructive: 'border-l-2 border-l-destructive',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, className, padding = 'md', emphasis, status, selected, pro, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        BASE_CARD,
        PADDING_CLASSES[padding],
        emphasis && 'bg-elevated',
        status && STATUS_BORDER[status],
        selected && 'border-primary/60 bg-primary/10',
        pro && 'border-pro-border bg-[linear-gradient(160deg,var(--pro-soft),var(--card)_70%)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'
