import { cn } from '@/utils/cn'
import { TAG_ACTIVE_CLASS, TAG_INACTIVE_CLASS } from '@/components/ui/ui-patterns'

const BADGE_VARIANTS = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success text-white',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-border bg-transparent text-foreground',
  tag: `border ${TAG_INACTIVE_CLASS}`,
  tagActive: `border ${TAG_ACTIVE_CLASS}`,
  // Resta semantic badges — spec: UI-система · Бейджи
  /** SOS — solid terracotta, только экстренные смены <3ч */
  sos: 'bg-primary text-white font-bold tracking-widest rounded-md',
  /** URGENT — subtle amber outline, менее срочное */
  urgent: 'bg-amber/8 text-amber border border-amber/35 font-semibold tracking-wider',
  /** VERIFIED — subtle green, проверенное заведение */
  verified: 'bg-success/10 text-success border border-success/30 font-semibold tracking-wider',
  /** ESCROW — outline green, критический сигнал доверия */
  escrow: 'bg-success/8 text-success border border-success/60 font-semibold tracking-wider',
  /** BOOSTED — amber, монетизация */
  boost: 'bg-amber/10 text-amber border border-amber/40 font-semibold tracking-wider',
  /** PRO — solid charcoal/foreground, подписка */
  pro: 'bg-foreground text-background font-bold tracking-widest',
  /** Warning soft */
  warning: 'bg-warning/10 text-warning border border-warning/25',
} as const

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: keyof typeof BADGE_VARIANTS
}

export const Badge = ({ children, className, variant = 'default' }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium align-middle whitespace-nowrap',
      BADGE_VARIANTS[variant],
      (variant === 'tag' || variant === 'tagActive') &&
        'max-w-full justify-center overflow-hidden text-ellipsis whitespace-nowrap leading-none',
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
