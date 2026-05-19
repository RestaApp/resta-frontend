import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { META_MONO_CLASS } from '@/components/ui/ui-patterns'
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
  const progress = `${Math.min(Math.max(current / total, 0), 1) * 100}%`

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div
        className="h-1 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={t('onboarding.stepOf', { current, total })}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: progress }}
        />
      </div>
      <p className={cn(META_MONO_CLASS, 'mt-2')}>{t('onboarding.stepOf', { current, total })}</p>
    </div>
  )
})
