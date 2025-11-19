import { cn } from '../../utils/cn'

interface AvatarProps {
  children: React.ReactNode
  className?: string
}

export function Avatar({ children, className }: AvatarProps) {
  return (
    <div className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}>
      {children}
    </div>
  )
}

interface AvatarFallbackProps {
  children: React.ReactNode
  className?: string
}

export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <div className={cn('flex h-full w-full items-center justify-center rounded-full', className)}>
      {children}
    </div>
  )
}
