import { cn } from '@/utils/cn'

const BADGE_VARIANTS = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success text-white',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-border bg-transparent',
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
      className
    )}
  >
    {children}
  </span>
)
