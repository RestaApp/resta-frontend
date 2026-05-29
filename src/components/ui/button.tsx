import { forwardRef, type ComponentProps } from 'react'
import { cn } from '@/utils/cn'
import { Loader } from '@/components/ui/loader'
import type { HapticFeedbackPattern } from '@/utils/haptics'

const SIZE_CLASSES = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-13 px-5 text-sm',
} as const

const LOADER_SLOT = {
  sm: 'w-3',
  md: 'w-5',
  lg: 'w-7',
} as const

const VARIANT_CLASSES = {
  /** Primary — сплошная заливка brand-цветом. */
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-[var(--shadow-primary-cta)]',
  /** Secondary — outline, no fill */
  secondary: 'border border-border bg-secondary text-foreground hover:bg-elevated',
  /** Outline — same as secondary */
  outline: 'border border-border bg-transparent text-foreground hover:bg-secondary',
  /** Ghost — без заливки, при hover — secondary. */
  ghost: 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground',
  /** Destructive — soft red. */
  destructive:
    'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20',
  /** Alias to `destructive` for spec naming alignment. */
  danger: 'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20',
  /** Success — зелёный solid CTA (например, «Нанять на смену»). */
  success:
    'bg-success text-white hover:bg-success/90 active:bg-success/80 shadow-[var(--shadow-success-cta)]',
  /** Telegram Stars — золотой gradient (для платных шагов и paywall CTA). */
  stars:
    'bg-[image:var(--gradient-stars)] text-white hover:opacity-95 active:opacity-90 border-0 shadow-[var(--shadow-stars-cta)]',
  /** Gradient CTA — primary gradient. */
  gradient:
    'bg-[image:var(--gradient-primary)] text-white hover:opacity-95 active:opacity-90 border-0 shadow-[var(--shadow-primary-cta)]',
  gradientPressed:
    'bg-secondary text-foreground/60 hover:bg-destructive/10 hover:text-destructive border border-destructive/20',
} as const

const BUTTON_HAPTIC_BY_VARIANT: Record<keyof typeof VARIANT_CLASSES, HapticFeedbackPattern> = {
  primary: 'medium',
  secondary: 'light',
  outline: 'light',
  ghost: 'light',
  destructive: 'heavy',
  danger: 'heavy',
  success: 'medium',
  stars: 'medium',
  gradient: 'medium',
  gradientPressed: 'light',
}

export type ButtonProps = {
  size?: keyof typeof SIZE_CLASSES
  variant?: keyof typeof VARIANT_CLASSES
  loading?: boolean
  pressed?: boolean
  type?: 'button' | 'submit' | 'reset'
  haptic?: HapticFeedbackPattern | false
  'data-haptic'?: HapticFeedbackPattern | 'none'
} & Omit<ComponentProps<'button'>, 'type' | 'data-haptic'>

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
      haptic,
      'data-haptic': dataHaptic,
      children,
      ...props
    },
    ref
  ) => {
    const effectiveVariant = variant === 'gradient' && pressed ? 'gradientPressed' : variant
    const isDisabled = disabled || loading
    const hapticPattern =
      dataHaptic ??
      (haptic === false ? 'none' : (haptic ?? BUTTON_HAPTIC_BY_VARIANT[effectiveVariant]))

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        data-haptic={hapticPattern}
        aria-busy={loading || undefined}
        aria-pressed={pressed || undefined}
        className={cn(
          'inline-flex min-w-fit items-center justify-center gap-1 rounded-md text-center font-semibold whitespace-nowrap transition-all',
          'cursor-pointer [-webkit-tap-highlight-color:transparent] active:opacity-85',
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
