import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

type ActionButtonProps = {
  isLoading?: boolean
  active?: boolean
} & Omit<ComponentProps<'button'>, 'type'> & {
  type?: 'button' | 'submit' | 'reset'
}

export const ActionButton = ({
  children,
  isLoading = false,
  active = false,
  disabled,
  className,
  type = 'button',
  ...rest
}: ActionButtonProps) => {
  const base = 'px-6 py-2 rounded-xl transition-all flex-shrink-0'

  const stateClass = isLoading
    ? 'bg-secondary text-foreground/70 cursor-wait'
    : active
      ? 'bg-secondary text-foreground/70 hover:bg-destructive/10 hover:text-destructive border border-destructive/20'
      : 'gradient-primary text-white hover:opacity-90 shadow-md'

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(base, stateClass, className)}
      {...rest}
    >
      {children}
    </button>
  )
}