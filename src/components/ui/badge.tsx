import { cn } from '@/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'destructive' | 'outline'
}

export const Badge = ({ children, className, variant = 'default' }: BadgeProps) => {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-chart-4 text-white',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-border bg-transparent',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
