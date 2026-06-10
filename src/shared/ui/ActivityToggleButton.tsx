import { memo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Check, EyeOff } from 'lucide-react'
import {
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'

export interface ActivityToggleButtonProps {
  checked: boolean
  disabled?: boolean
  onToggle: (nextValue: boolean) => void
  variant?: 'full' | 'compact'
  checkedLabel: string
  uncheckedLabel: string
  checkedHint: string
  uncheckedHint: string
  className?: string
}

/** Компактная кнопка активности: зелёная галочка / серый EyeOff — как Open to work. */
export const ActivityToggleButton = memo(function ActivityToggleButton({
  checked,
  disabled = false,
  onToggle,
  variant = 'full',
  checkedLabel,
  uncheckedLabel,
  checkedHint,
  uncheckedHint,
  className,
}: ActivityToggleButtonProps) {
  const reduceMotion = useReducedMotion()
  const isCompact = variant === 'compact'

  const statusLabel = checked ? checkedLabel : uncheckedLabel
  const hintLabel = checked ? checkedHint : uncheckedHint

  const icon = (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full transition-colors duration-300 ease-out',
        isCompact ? 'size-6' : 'size-5',
        checked ? 'bg-success text-white' : 'bg-muted-foreground/25 text-muted-foreground'
      )}
      aria-hidden="true"
    >
      {checked ? (
        <Check className={cn(isCompact ? 'h-3.5 w-3.5' : 'h-3 w-3')} strokeWidth={3} />
      ) : (
        <EyeOff className={cn(isCompact ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
      )}
    </span>
  )

  return (
    <motion.button
      type="button"
      className={cn(
        'flex items-center text-left transition-colors duration-300 ease-out',
        isCompact
          ? 'size-9 shrink-0 items-center justify-center rounded-full p-0'
          : 'h-11 w-full justify-between gap-3 rounded-full px-4',
        checked ? 'bg-success/10' : 'bg-secondary',
        'disabled:cursor-not-allowed disabled:opacity-70',
        className
      )}
      onClick={() => onToggle(!checked)}
      disabled={disabled}
      data-haptic="selection"
      aria-pressed={checked}
      aria-label={`${statusLabel}. ${hintLabel}`}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.98 }}
    >
      {isCompact ? (
        icon
      ) : (
        <>
          <span className="flex min-w-0 shrink-0 items-center gap-2">
            {icon}
            <span
              className={cn(
                SHIFT_CARD_TITLE_CLASS,
                checked ? 'text-success' : 'text-muted-foreground'
              )}
            >
              {statusLabel}
            </span>
          </span>
          <span className={cn(SHIFT_CARD_SUB_CLASS, 'shrink-0')}>{hintLabel}</span>
        </>
      )}
    </motion.button>
  )
})
