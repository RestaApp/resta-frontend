import { cn } from '@/utils/cn'
import { TAG_ACTIVE_CLASS, TAG_INACTIVE_CLASS } from '@/components/ui/ui-patterns'

const BADGE_VARIANTS = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success text-white',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-border bg-transparent',
  tag: `border ${TAG_INACTIVE_CLASS}`,
  tagActive: `border ${TAG_ACTIVE_CLASS}`,
} as const

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: keyof typeof BADGE_VARIANTS
}

export const Badge = ({ children, className, variant = 'default' }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      BADGE_VARIANTS[variant],
      (variant === 'tag' || variant === 'tagActive') &&
        'max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
      className
    )}
  >
    {children}
  </span>
)
