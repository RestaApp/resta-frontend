import { forwardRef, type ComponentProps } from 'react'
import { cn } from '@/utils/cn'
import { Loader } from '@/components/ui/loader'

const SIZE_CLASSES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
} as const

const LOADER_SLOT = {
  sm: 'w-3',
  md: 'w-4',
  lg: 'w-5',
} as const

const VARIANT_CLASSES = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-border bg-transparent hover:bg-muted',
  ghost: 'bg-transparent hover:bg-muted',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  gradient:
    'gradient-primary text-white hover:opacity-90 shadow-md border-0 border-transparent',
  gradientPressed:
    'bg-secondary text-foreground/70 hover:bg-destructive/10 hover:text-destructive border border-destructive/20',
} as const

export type ButtonProps = {
  size?: keyof typeof SIZE_CLASSES
  variant?: keyof typeof VARIANT_CLASSES
  loading?: boolean
  pressed?: boolean
  type?: 'button' | 'submit' | 'reset'
} & Omit<ComponentProps<'button'>, 'type'>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = 'md',
      variant = 'primary',
      disabled,
      loading = false,
      pressed = false,
      type = 'button',
      children,
      ...props
    },
    ref
  ) => {
    const effectiveVariant =
      variant === 'gradient' && pressed ? 'gradientPressed' : variant
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-pressed={pressed || undefined}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          SIZE_CLASSES[size],
          VARIANT_CLASSES[effectiveVariant],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className={cn('inline-flex justify-center shrink-0', LOADER_SLOT[size])}>
            <Loader size="sm" />
          </span>
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
