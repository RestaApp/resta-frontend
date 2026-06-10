import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { META_MONO_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'

const STEP_TRANSITION = { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }

export interface StepProgressProps {
  /** Текущий шаг (1-based). */
  current: number
  /** Общее число шагов. */
  total: number
  className?: string
  /** i18n-ключ подписи шага. По умолчанию — `onboarding.stepOf`. */
  labelKey?: string
  /** i18n-ключ названия шага для подписи «Step N of M · Name». */
  stepNameKey?: string
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
  stepNameKey,
}: StepProgressProps) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const safeCurrent = Math.min(Math.max(current, 1), total)
  const ariaLabel = stepNameKey
    ? t('onboarding.stepOfNamed', {
        current: safeCurrent,
        total,
        name: t(stepNameKey),
      })
    : t(labelKey, { current: safeCurrent, total })
  const fillRatio = total <= 1 ? 0 : (safeCurrent - 1) / (total - 1)

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <p className={cn(META_MONO_CLASS, 'tabular-nums')} aria-live="polite" aria-atomic="true">
        {ariaLabel}
      </p>

      <div
        className="relative flex w-full items-center justify-between"
        role="progressbar"
        aria-valuenow={safeCurrent}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={ariaLabel}
      >
        {total > 1 ? (
          <>
            <div
              className="bg-muted-foreground/20 absolute top-1/2 right-[5px] left-[5px] h-0.5 -translate-y-1/2 rounded-full"
              aria-hidden
            />
            <motion.div
              className="bg-primary absolute top-1/2 left-[5px] h-0.5 origin-left -translate-y-1/2 rounded-full"
              aria-hidden
              initial={false}
              animate={{
                width: `calc((100% - 10px) * ${fillRatio})`,
              }}
              transition={reduceMotion ? { duration: 0 } : STEP_TRANSITION}
            />
          </>
        ) : null}

        {Array.from({ length: total }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < safeCurrent
          const isActive = stepNumber === safeCurrent

          return (
            <div
              key={stepNumber}
              className={cn(
                'relative z-10 h-2.5 w-2.5 shrink-0 rounded-full border-2 transition-colors duration-300 ease-out',
                isCompleted || isActive
                  ? 'border-primary bg-primary'
                  : 'bg-background border-muted-foreground/30'
              )}
              aria-hidden
            />
          )
        })}
      </div>
    </div>
  )
})
