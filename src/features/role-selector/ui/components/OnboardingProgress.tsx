import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

type ProgressTone = 'primary' | 'employee' | 'restaurant' | 'supplier'

const TONE_BAR: Record<ProgressTone, string> = {
  primary: 'bg-primary',
  employee: 'bg-role-employee',
  restaurant: 'bg-role-restaurant',
  supplier: 'bg-role-supplier',
}

interface OnboardingProgressProps {
  current: number
  total: number
  className?: string
  tone?: ProgressTone
}

export const OnboardingProgress = memo(function OnboardingProgress({
  current,
  total,
  className,
  tone = 'primary',
}: OnboardingProgressProps) {
  const { t } = useTranslation()
  const progress = `${Math.min(Math.max(current / total, 0), 1) * 100}%`

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div
        className="h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={t('onboarding.stepOf', { current, total })}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', TONE_BAR[tone])}
          style={{ width: progress }}
        />
      </div>
      <p className="font-mono-resta text-micro tracking-widest uppercase text-muted-foreground mt-2">
        {t('onboarding.stepOf', { current, total })}
      </p>
    </div>
  )
})
