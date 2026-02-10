import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const BASE_CARD =
  'rounded-3xl border border-border bg-card backdrop-blur-xl transition-all'

type CardProps = {
  children?: React.ReactNode
  className?: string
}

type ClickableCardProps = CardProps & {
  onClick: () => void
}

export function Card({ children, className }: CardProps) {
  return <div className={cn(BASE_CARD, className)}>{children}</div>
}

export const ClickableCard = forwardRef<HTMLButtonElement, ClickableCardProps>(
  function ClickableCard({ children, className, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          BASE_CARD,
          'block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          className
        )}
      >
        {children}
      </button>
    )
  }
)
