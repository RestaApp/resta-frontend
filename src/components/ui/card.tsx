import { cn } from '../../utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn('bg-card rounded-3xl border border-border transition-all', className)}
    >
      {children}
    </div>
  )
}
