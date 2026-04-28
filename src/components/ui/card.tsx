import { cn } from '@/utils/cn'

const BASE_CARD = 'rounded-xl border bg-card transition-all border-[var(--surface-stroke-soft)]'

type CardProps = {
  children?: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <div className={cn(BASE_CARD, className)}>{children}</div>
}
