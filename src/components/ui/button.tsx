import { forwardRef, type ComponentProps } from 'react'
import { cn } from '@/utils/cn'
import { Loader } from '@/components/ui/loader'

const SIZE_CLASSES = {
  // 44px inline buttons (spec)
  sm: 'h-11 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  // 52px sticky CTA (spec)
  lg: 'h-[52px] px-6 text-base',
} as const

const LOADER_SLOT = {
  sm: 'w-4',
  md: 'w-4',
  lg: 'w-5',
} as const

const VARIANT_CLASSES = {
  /** Primary — terracotta solid. Only this gets solid fill per spec. */
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
  /** Secondary — outline, no fill */
  secondary: 'border border-border bg-transparent text-foreground hover:bg-muted/60',
  /** Outline — same as secondary */
  outline: 'border border-border bg-transparent text-foreground hover:bg-muted/60',
  /** Ghost — text only, terracotta color */
  ghost: 'bg-transparent text-primary hover:bg-primary/8',
  /** Destructive */
  destructive: 'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20',
  /** Gradient alias → solid primary (terracotta) */
  gradient: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80 shadow-sm border-0',
  gradientPressed:
    'bg-muted text-foreground/60 hover:bg-destructive/10 hover:text-destructive border border-destructive/20',
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
      size = 'sm',
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
    const effectiveVariant = variant === 'gradient' && pressed ? 'gradientPressed' : variant
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-pressed={pressed || undefined}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all whitespace-nowrap',
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
