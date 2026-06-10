import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ResultOverlay } from '@/components/ui/result-overlay'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_FALLBACK_CLASS, AVATAR_SM_CLASS } from '@/components/ui/avatar-styles'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_META_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { positionInitial } from '@/components/ui/shift-card/shift-card-utils'
import type { Shift } from '@/shared/shifts/types'
import { formatMoney } from '@/shared/shifts/formatting'
import { cn } from '@/shared/utils/cn'

interface ApplicationSuccessOverlayProps {
  open: boolean
  shift: Shift | null
  onOpenApplications: () => void
  onSearchMore: () => void
  onClose: () => void
}

const formatCompactShiftDate = (dateKey?: string | null, date?: string | null): string | null => {
  if (dateKey) {
    const parsed = new Date(`${dateKey}T12:00:00`)
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(parsed)
    }
  }

  if (!date) return null

  return date
    .replace('января', 'янв')
    .replace('февраля', 'фев')
    .replace('марта', 'мар')
    .replace('апреля', 'апр')
    .replace('мая', 'мая')
    .replace('июня', 'июн')
    .replace('июля', 'июл')
    .replace('августа', 'авг')
    .replace('сентября', 'сен')
    .replace('октября', 'окт')
    .replace('ноября', 'ноя')
    .replace('декабря', 'дек')
}

const buildApplicationSuccessMeta = (shift: Shift): string | null => {
  const compactDate = formatCompactShiftDate(shift.dateKey, shift.date)
  const pay =
    shift.pay != null && Number(shift.pay) > 0
      ? `${formatMoney(Number(shift.pay))} ${shift.currency}`
      : null

  return [compactDate, shift.time, pay].filter(Boolean).join(' • ') || null
}

export const ApplicationSuccessOverlay = ({
  open,
  shift,
  onOpenApplications,
  onSearchMore,
  onClose,
}: ApplicationSuccessOverlayProps) => {
  const { t } = useTranslation()

  const meta = useMemo(() => (shift ? buildApplicationSuccessMeta(shift) : null), [shift])

  if (!open || !shift) return null

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
      }}
      secondaryAction={{
        label: t('feed.searchMoreShifts'),
        onClick: onSearchMore,
        variant: 'outline',
      }}
    >
      <Card className={cn(SHIFT_CARD_CLASS, 'w-full text-left')}>
        <div className="flex items-start gap-2.5">
          <Avatar className={cn(AVATAR_SM_CLASS, 'self-start')}>
            <AvatarImage src={shift.photoUrl ?? undefined} alt={shift.restaurant} />
            <AvatarFallback className={AVATAR_FALLBACK_CLASS}>
              {positionInitial(shift.position)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className={cn(SHIFT_CARD_TITLE_CLASS, 'min-w-0 flex-1 truncate')}>
                {shift.restaurant}
              </p>
              <Badge variant="pending" className="shrink-0">
                {t('activity.statusPending')}
              </Badge>
            </div>
            {meta ? <p className={cn(SHIFT_CARD_META_CLASS, 'mt-1')}>{meta}</p> : null}
          </div>
        </div>
      </Card>
    </ResultOverlay>
  )
}
