/**
 * Прогресс онбординга: «Шаг X из Y»
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

interface OnboardingProgressProps {
  current: number
  total: number
  className?: string
}

export const OnboardingProgress = memo(function OnboardingProgress({
  current,
  total,
  className,
}: OnboardingProgressProps) {
  const { t } = useTranslation()
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">
        {t('onboarding.stepOf', { current, total })}
      </p>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full gradient-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={t('onboarding.stepOf', { current, total })}
        />
      </div>
    </div>
  )
})
