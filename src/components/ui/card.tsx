import { cn } from '@/utils/cn'

type CardProps = {
  children: React.ReactNode
  className?: string
}

type ClickableCardProps = CardProps & {
  onClick: () => void
}

export const Card = ({ children, className }: CardProps) => (
  <div className={cn('rounded-3xl border border-border bg-card backdrop-blur-xl transition-all', className)}>
    {children}
  </div>
)

export const ClickableCard = ({ children, className, onClick }: ClickableCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'block w-full text-left rounded-3xl border border-border bg-card backdrop-blur-xl transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      className
    )}
  >
    {children}
  </button>
)