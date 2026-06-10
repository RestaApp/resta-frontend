import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, EyeOff } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

const OPEN_TO_WORK_TRANSITION = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }

export interface OpenToWorkButtonProps {
  checked: boolean
  disabled?: boolean
  onToggle: (nextValue: boolean) => void
  className?: string
}

export const OpenToWorkButton = memo(function OpenToWorkButton({
  checked,
  disabled = false,
  onToggle,
  className,
}: OpenToWorkButtonProps) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion ? { duration: 0 } : OPEN_TO_WORK_TRANSITION

  const statusLabel = checked ? t('profile.openToWorkShort') : t('profile.openToWorkOff')
  const hintLabel = checked ? t('profile.openToWorkCatalogHint') : t('profile.openToWorkHiddenHint')

  return (
    <motion.button
      type="button"
      className={cn(
        'flex h-11 w-full items-center justify-between gap-3 rounded-full px-4 text-left transition-colors duration-300 ease-out',
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
      <span className="flex min-w-0 shrink-0 items-center gap-2">
        <span
          className={cn(
            'relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-300 ease-out',
            checked ? 'bg-success text-white' : 'bg-muted-foreground/25 text-muted-foreground'
          )}
          aria-hidden="true"
        >
          <AnimatePresence mode="wait" initial={false}>
            {checked ? (
              <motion.span
                key="open"
                className="absolute inset-0 flex items-center justify-center"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.7, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.7, rotate: 45 }}
                transition={transition}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </motion.span>
            ) : (
              <motion.span
                key="closed"
                className="absolute inset-0 flex items-center justify-center"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.7 }}
                transition={transition}
              >
                <EyeOff className="h-3 w-3" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={statusLabel}
            className={cn(
              'text-sm font-semibold transition-colors duration-300 ease-out',
              checked ? 'text-success' : 'text-muted-foreground'
            )}
            initial={reduceMotion ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: 6 }}
            transition={transition}
          >
            {statusLabel}
          </motion.span>
        </AnimatePresence>
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={hintLabel}
          className="shrink-0 text-xs text-muted-foreground"
          initial={reduceMotion ? false : { opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -6 }}
          transition={transition}
        >
          {hintLabel}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
})
