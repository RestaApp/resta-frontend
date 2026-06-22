import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { useGetCurrentSubscriptionQuery } from '@/services/api/subscriptionsApi'
import { MONETIZATION_ENABLED } from '@/shared/config/monetization'
import { HelpHint } from '@/components/ui/help-hint'
import { cn } from '@/shared/utils/cn'
import type { ShiftType } from '@/shared/shifts/types'

/**
 * Индикатор месячных лимитов «осталось N из M» рядом с созданием смены.
 * Виден только при включённом флаге и непустом usage (Flipper OFF на бэке).
 */
export const UsageIndicator = memo(function UsageIndicator({
  shiftType,
}: {
  shiftType: ShiftType
}) {
  const { t } = useTranslation()
  const { data } = useGetCurrentSubscriptionQuery(undefined, { skip: !MONETIZATION_ENABLED })

  const usage = data?.data.usage
  if (!MONETIZATION_ENABLED || !usage) return null

  const entry = shiftType === 'vacancy' ? usage.monthly_vacancies : usage.monthly_replacements
  if (!entry) return null

  const exhausted = entry.remaining <= 0
  const label =
    shiftType === 'vacancy'
      ? t('monetization.usage.vacancies', { remaining: entry.remaining, limit: entry.limit })
      : t('monetization.usage.replacements', { remaining: entry.remaining, limit: entry.limit })

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium',
        exhausted
          ? 'bg-warning/10 text-warning-foreground'
          : 'bg-secondary/50 text-muted-foreground'
      )}
    >
      {exhausted ? <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      <span>{exhausted ? t('monetization.usage.exhausted') : label}</span>
      <HelpHint topic="limits" className="ml-auto" />
    </div>
  )
})
