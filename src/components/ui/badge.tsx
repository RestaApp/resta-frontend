import { cn } from '@/utils/cn'
import { TAG_ACTIVE_CLASS, TAG_INACTIVE_CLASS } from '@/components/ui/ui-patterns'

/**
 * Resta semantic badges — соответствуют легенде из Resta Wireframes.
 * Каждый вариант — отдельная зона ответственности (SRP):
 *   sos       — экстренная смена <3ч
 *   urgent    — менее срочная (amber outline)
 *   verified  — проверенное заведение/сотрудник
 *   direct    — DIRECT PAY (без комиссии Resta)
 *   boost     — платное продвижение смены
 *   pro       — подписка PRO
 *   stars     — Telegram Stars
 *   pending   — ожидание / в работе
 *   ok / rej  — итоговый статус
 */
const BADGE_VARIANTS = {
  default: 'bg-muted-foreground/15 text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-[var(--surface-subtle)] text-secondary-foreground border border-border',
  success: 'bg-success text-white',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-border bg-transparent text-foreground',
  tag: `border ${TAG_INACTIVE_CLASS}`,
  tagActive: `border ${TAG_ACTIVE_CLASS}`,

  sos: 'bg-terracotta text-white font-bold tracking-widest',
  urgent: 'bg-terracotta/15 text-terracotta border border-transparent font-semibold tracking-wider',
  verified: 'bg-success/10 text-success border border-success/30 font-semibold tracking-wider',
  direct: 'bg-success/10 text-success border border-success/40 font-semibold tracking-wider',
  boost: 'bg-amber/10 text-amber border border-amber/30 font-semibold tracking-wider',
  pro: 'bg-[image:var(--gradient-pro)] text-white font-bold tracking-widest',
  stars: 'bg-[image:var(--gradient-stars)] text-white font-bold tracking-widest',
  pending: 'bg-muted-foreground/15 text-muted-foreground font-semibold tracking-wider',
  ok: 'bg-success/15 text-success font-semibold tracking-wider',
  rej: 'bg-destructive/15 text-destructive font-semibold tracking-wider',

  warning: 'bg-warning/10 text-warning border border-warning/25',
  /** @deprecated — оплата теперь DIRECT, эскроу убран. Используйте `direct`. */
  escrow: 'bg-success/8 text-success border border-success/60 font-semibold tracking-wider',
} as const

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: keyof typeof BADGE_VARIANTS
}

export const Badge = ({ children, className, variant = 'default' }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-micro font-mono-resta font-bold uppercase tracking-wider align-middle whitespace-nowrap leading-none',
      BADGE_VARIANTS[variant],
      (variant === 'tag' || variant === 'tagActive') &&
        'rounded-lg px-2.5 text-xs normal-case tracking-normal max-w-full justify-center overflow-hidden text-ellipsis whitespace-nowrap leading-none',
      className
    )}
  >
    <span
      className={cn(
        variant === 'tag' || variant === 'tagActive'
          ? 'relative -top-px inline-flex items-center gap-1 whitespace-nowrap [&>svg]:shrink-0'
          : 'inline-flex items-center gap-1 whitespace-nowrap [&>svg]:shrink-0'
      )}
    >
      {children}
    </span>
  </span>
)
