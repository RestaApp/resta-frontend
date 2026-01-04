import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const Card = ({ children, className, onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn('rounded-3xl border border-border transition-all backdrop-blur-xl bg-card', className)}
    >
      {children}
    </div>
  )
}
