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

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={t('onboarding.stepOf', { current, total })}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-[3px] flex-1 rounded-full transition-all duration-300',
              i < current ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className="font-mono-resta text-[11px] tracking-widest uppercase text-muted-foreground mt-2">
        {t('onboarding.stepLabel', { defaultValue: 'ШАГ' })} {current}{' '}
        <span className="opacity-40">·</span> {total}
      </p>
    </div>
  )
})
