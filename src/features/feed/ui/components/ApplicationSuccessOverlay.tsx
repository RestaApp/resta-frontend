import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ResultOverlay } from '@/components/ui/result-overlay'
import { SUBSECTION_TITLE_CLASS } from '@/components/ui/ui-patterns'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_META_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import type { Shift } from '@/shared/shifts/types'
import { formatMoney } from '@/shared/shifts/formatting'
import { useLabels } from '@/shared/i18n/hooks'
import { cn } from '@/utils/cn'
import { stripVacancyPrefix } from '@/components/ui/shift-card/shift-card-utils'

interface ApplicationSuccessOverlayProps {
  open: boolean
  shift: Shift | null
  onOpenApplications: () => void
  onSearchMore: () => void
  onClose: () => void
}

export const ApplicationSuccessOverlay = ({
  open,
  shift,
  onOpenApplications,
  onSearchMore,
  onClose,
}: ApplicationSuccessOverlayProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel } = useLabels()

  if (!open || !shift) return null

  const positionLabel = getEmployeePositionLabel(shift.position)
  const title = stripVacancyPrefix(shift.title?.trim() || positionLabel)
  const cardTitle = [shift.restaurant, title].filter(Boolean).join(' · ')
  const pay = shift.pay ? `${formatMoney(Number(shift.pay))} ${shift.currency}` : null
  const meta = [shift.time, pay].filter(Boolean).join('   ')

  return (
    <ResultOverlay
      open={open}
      tone="success"
      title={t('feed.applicationSuccessTitle')}
      description={t('feed.applicationSuccessDescription')}
      onClose={onClose}
      primaryAction={{
        label: t('feed.openMyApplications'),
        onClick: onOpenApplications,
        variant: 'gradient',
        size: 'lg',
      }}
      secondaryAction={{
        label: t('feed.searchMoreShifts'),
        onClick: onSearchMore,
        variant: 'outline',
        size: 'sm',
      }}
    >
      <Card className={cn(SHIFT_CARD_CLASS, 'w-full max-w-70 text-left')}>
        <div className="flex items-start justify-between gap-2">
          <p className={cn(SUBSECTION_TITLE_CLASS, 'min-w-0 flex-1 truncate')}>{cardTitle}</p>
          <Badge variant="pending">{t('activity.statusPending')}</Badge>
        </div>
        {meta ? <p className={cn(SHIFT_CARD_META_CLASS, 'mt-2')}>{meta}</p> : null}
      </Card>
    </ResultOverlay>
  )
}
