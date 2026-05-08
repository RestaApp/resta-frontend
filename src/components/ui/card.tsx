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
const BASE_CARD = 'rounded-xl border bg-card transition-colors border-[var(--surface-stroke-soft)]'

const PADDING_CLASSES = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
} as const

export type CardPadding = keyof typeof PADDING_CLASSES

interface CardProps {
  children?: React.ReactNode
  className?: string
  padding?: CardPadding
  /** Подсветить как highlighted (более тёмный surface, как E04 hl). */
  emphasis?: boolean
  /** Выделение role/status — границей слева. */
  accent?: 'success' | 'warning' | 'destructive' | 'primary'
}

const ACCENT_BORDER: Record<NonNullable<CardProps['accent']>, string> = {
  primary: 'border-l-2 border-l-primary',
  success: 'border-l-2 border-l-success',
  warning: 'border-l-2 border-l-warning',
  destructive: 'border-l-2 border-l-destructive',
}

export function Card({ children, className, padding = 'md', emphasis, accent }: CardProps) {
  return (
    <div
      className={cn(
        BASE_CARD,
        PADDING_CLASSES[padding],
        emphasis && 'bg-[var(--surface-subtle)]',
        accent && ACCENT_BORDER[accent],
        className
      )}
    >
      {children}
    </div>
  )
}
