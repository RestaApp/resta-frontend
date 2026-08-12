import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'

interface ProfileCompletionCardProps {
  percent: number
}

export const ProfileCompletionCard = memo(function ProfileCompletionCard({
  percent,
}: ProfileCompletionCardProps) {
  const { t } = useTranslation()
  const normalizedPercent = Math.min(100, Math.max(0, Math.round(percent)))

  return (
    <Card padding="sm" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-foreground">{t('profile.completion')}</span>
        <span className="font-mono-resta text-xs font-semibold text-primary">
          {normalizedPercent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t('profile.completion')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedPercent}
        className="h-2 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${normalizedPercent}%` }}
        />
      </div>
    </Card>
  )
})
