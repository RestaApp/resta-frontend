import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { META_MONO_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'

const STEP_TRANSITION = { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const }
const LABEL_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const }

export interface StepProgressProps {
  /** Текущий шаг (1-based). */
  current: number
  /** Общее число шагов. */
  total: number
  className?: string
  /** i18n-ключ подписи шага. По умолчанию — `onboarding.stepOf`. */
  labelKey?: string
}

/**
 * Единый индикатор мультистепового флоу: mono-подпись + точки на всю ширину.
 * Используется в онбординге, редактировании профиля, создании смены/вакансии.
 */
export const StepProgress = memo(function StepProgress({
  current,
  total,
  className,
  labelKey = 'onboarding.stepOf',
}: StepProgressProps) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const safeCurrent = Math.min(Math.max(current, 1), total)
  const ariaLabel = t(labelKey, { current: safeCurrent, total })

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={safeCurrent}
          className={META_MONO_CLASS}
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
          transition={reduceMotion ? { duration: 0 } : LABEL_TRANSITION}
        >
          {ariaLabel}
        </motion.p>
      </AnimatePresence>

      <div
        className="flex w-full items-center"
        role="progressbar"
        aria-valuenow={safeCurrent}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={ariaLabel}
      >
        {Array.from({ length: total }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < safeCurrent
          const isActive = stepNumber === safeCurrent
          const isLast = index === total - 1

          return (
            <div key={stepNumber} className={cn('flex items-center', !isLast && 'min-w-0 flex-1')}>
              <motion.div
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-full border-2',
                  isCompleted || isActive
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30 bg-background'
                )}
                initial={false}
                animate={{
                  scale: reduceMotion ? 1 : isActive ? 1.12 : 1,
                }}
                transition={reduceMotion ? { duration: 0 } : STEP_TRANSITION}
              />
              {!isLast ? (
                <div className="relative mx-1.5 h-0.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted-foreground/20">
                  <motion.div
                    className="absolute inset-0 origin-left rounded-full bg-primary"
                    initial={false}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    transition={reduceMotion ? { duration: 0 } : STEP_TRANSITION}
                  />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
})
