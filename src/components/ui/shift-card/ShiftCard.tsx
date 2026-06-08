import { memo, useCallback, useMemo } from 'react'
import type { KeyboardEvent } from 'react'
import { Clock, Flame, MapPin, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import type { Shift } from '@/shared/shifts/types'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney } from '@/shared/shifts/formatting'
import { useCurrentUserId } from '@/shared/shifts/useCurrentUserId'
import { cn } from '@/shared/utils/cn'
import { firstLocation } from '@/shared/utils/location'
import { addDaysToISODate, toLocalISODateKey } from '@/shared/utils/datetime'
import { Badge } from '@/components/ui/badge'
import {
  SHIFT_CARD_BADGE_CLASS,
  SHIFT_CARD_BADGE_ROW_CLASS,
  SHIFT_CARD_CLASS,
  SHIFT_CARD_CURRENCY_CLASS,
  SHIFT_CARD_INTERACTIVE_CLASS,
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_META_CLASS,
  SHIFT_CARD_PRICE_CLASS,
  SHIFT_CARD_ROW_CLASS,
  SHIFT_CARD_SOS_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { formatDistanceKm, stripVacancyPrefix, positionInitial } from './shift-card-utils'

const formatCompactDate = (date?: string | null): string => {
  if (!date) return ''
  return date
    .replace('января', 'янв')
    .replace('февраля', 'фев')
    .replace('марта', 'мар')
    .replace('апреля', 'апр')
    .replace('июня', 'июн')
    .replace('июля', 'июл')
    .replace('августа', 'авг')
    .replace('сентября', 'сен')
    .replace('октября', 'окт')
    .replace('ноября', 'ноя')
    .replace('декабря', 'дек')
}

const formatCompactTime = (time?: string | null): string => {
  if (!time) return ''
  return time
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/:00/g, '')
    .replace(/\b0(\d)/g, '$1')
    .replace(/\s*[–-]\s*/g, '–')
}

const formatCompactSchedule = (date?: string | null, time?: string | null): string => {
  return [formatCompactDate(date), formatCompactTime(time)].filter(Boolean).join(' ')
}

const getUrgentDateTag = (dateKey?: string | null): string => {
  if (!dateKey) return ''
  const todayKey = toLocalISODateKey(new Date())
  if (dateKey === todayKey) return 'СЕГОДНЯ'
  const tomorrowKey = addDaysToISODate(todayKey, 1)
  if (dateKey === tomorrowKey) return 'ЗАВТРА'
  return ''
}

const getApplicationBadgeVariant = (
  status?: string | null
): 'pending' | 'accepted' | 'rejected' => {
  if (status === 'accepted') return 'accepted'
  if (status === 'rejected') return 'rejected'
  return 'pending'
}

export interface ShiftCardProps {
  shift: Shift
  onOpenDetails: (id: number) => void
}

const ShiftCardComponent = ({ shift, onOpenDetails }: ShiftCardProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()
  const currentUserId = useCurrentUserId()

  const isOwner = useMemo(
    () => shift.isMine === true || Boolean(shift.ownerId && shift.ownerId === currentUserId),
    [shift.isMine, shift.ownerId, currentUserId]
  )

  const positionText = useMemo(() => {
    const position = getEmployeePositionLabel(shift.position)
    const specialization = shift.specialization
      ? ` • ${getSpecializationLabel(shift.specialization)}`
      : ''
    return `${position}${specialization}`
  }, [shift.position, shift.specialization, getEmployeePositionLabel, getSpecializationLabel])

  const locationText = useMemo(() => {
    const first = firstLocation(shift.location)
    if (!first) return shift.city ?? ''
    const street = first.replace(/^Минск,\s*/i, '')
    if (shift.city && !first.toLowerCase().startsWith(shift.city.toLowerCase())) {
      return `${shift.city}, ${street}`
    }
    return street
  }, [shift.location, shift.city])

  const isVacancyCard = shift.shiftType === 'vacancy' || shift.payPeriod === 'month'

  const displayTitle = useMemo(
    () => (shift.title?.trim() || '').slice(0, 80) || null,
    [shift.title]
  )

  const cardAriaLabel = useMemo(
    () => [displayTitle, shift.restaurant, positionText, locationText].filter(Boolean).join(', '),
    [displayTitle, shift.restaurant, positionText, locationText]
  )

  const handleOpen = useCallback(() => onOpenDetails(shift.id), [onOpenDetails, shift.id])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleOpen()
      }
    },
    [handleOpen]
  )

  const responses = useMemo(() => {
    if (!isOwner) return null
    const countRaw = shift.applicationsCount
    const count = typeof countRaw === 'number' && Number.isFinite(countRaw) ? countRaw : 0
    return { count, hasResponses: count > 0 }
  }, [isOwner, shift.applicationsCount])

  const compactTitle = stripVacancyPrefix(displayTitle ?? positionText)
  const locationMeta = formatDistanceKm(shift.distanceKm) ?? locationText
  const compactSchedule = formatCompactSchedule(shift.date, shift.time)
  const compactPrice = shift.pay == null || Number(shift.pay) === 0 ? null : formatMoney(shift.pay)
  const urgentDateTag = getUrgentDateTag(shift.dateKey)
  const compactSubtitle =
    [shift.restaurant, !isVacancyCard ? positionText : null].filter(Boolean).join(' · ') ||
    positionText
  const applicationStatus =
    !isOwner && shift.applicationId ? (shift.applicationStatus ?? 'pending') : null
  const applicationBadgeVariant = getApplicationBadgeVariant(applicationStatus)
  const applicationBadgeLabel = applicationStatus
    ? applicationStatus === 'accepted'
      ? t('activity.statusAcceptedPill')
      : applicationStatus === 'rejected'
        ? t('activity.statusRejectedPill')
        : t('activity.statusPendingPill')
    : null
  const compactApplications = responses?.hasResponses
    ? responses.count
    : typeof shift.applicationsCount === 'number' && shift.applicationsCount > 0
      ? shift.applicationsCount
      : null
  const statusTagLabel =
    shift.statusTag === 'expired'
      ? t('activity.statusExpired', { defaultValue: 'Просрочена' })
      : null
  const hasBottomRightMeta = Boolean(statusTagLabel) || Boolean(compactApplications)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={cardAriaLabel}
      data-haptic="light"
      onKeyDown={handleKeyDown}
      onClick={handleOpen}
      className={cn(
        SHIFT_CARD_CLASS,
        SHIFT_CARD_INTERACTIVE_CLASS,
        'flex flex-col gap-2',
        shift.urgent && SHIFT_CARD_SOS_CLASS
      )}
    >
      <div className={SHIFT_CARD_ROW_CLASS}>
        <div className="min-w-0 flex-1">
          {shift.urgent || applicationBadgeLabel ? (
            <div className={cn(SHIFT_CARD_BADGE_ROW_CLASS, 'flex flex-wrap gap-1.5')}>
              {shift.urgent ? (
                <span className={cn(SHIFT_CARD_BADGE_CLASS, 'inline-flex items-center gap-1')}>
                  <Flame className={ICON_SM_CLASS} aria-hidden />
                  SOS{urgentDateTag ? ` · ${urgentDateTag}` : ''}
                </span>
              ) : null}
              {applicationBadgeLabel ? (
                <Badge variant={applicationBadgeVariant} className="shrink-0">
                  {applicationBadgeLabel}
                </Badge>
              ) : null}
            </div>
          ) : null}
          <div className={cn('flex min-w-0 items-start gap-2', shift.urgent && 'gap-0')}>
            {!shift.urgent ? (
              <div className={SHIFT_CARD_LOGO_CLASS}>{positionInitial(shift.position)}</div>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h3 className={cn(SHIFT_CARD_TITLE_CLASS, 'line-clamp-2')}>{compactTitle}</h3>
              <p className={SHIFT_CARD_SUB_CLASS}>{compactSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right leading-none tabular-nums text-foreground">
          {compactPrice ? (
            <>
              <span className={SHIFT_CARD_PRICE_CLASS}>{compactPrice}</span>
              <span className={SHIFT_CARD_CURRENCY_CLASS}>{shift.currency}</span>
            </>
          ) : (
            <span className={cn(SHIFT_CARD_SUB_CLASS, 'font-semibold')}>
              {t('shift.payNegotiable')}
            </span>
          )}
        </div>
      </div>

      <div className={cn(SHIFT_CARD_META_CLASS, 'min-w-0')}>
        {compactSchedule ? (
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock className={ICON_SM_CLASS} aria-hidden />
            {compactSchedule}
          </span>
        ) : null}
        {hasBottomRightMeta ? (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5">
            {compactApplications ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <User className={ICON_SM_CLASS} aria-hidden />
                {compactApplications}
              </span>
            ) : null}
            {statusTagLabel ? (
              <Badge variant="rej" className="shrink-0">
                {statusTagLabel}
              </Badge>
            ) : null}
          </span>
        ) : null}
      </div>
      {locationMeta ? (
        <span className="inline-flex min-w-0 items-center gap-1 truncate font-mono-resta text-xs tracking-wide text-muted-foreground">
          <MapPin className={ICON_SM_CLASS} aria-hidden />
          {locationMeta}
        </span>
      ) : null}
    </div>
  )
}

export const FeedCard = memo(ShiftCardComponent)
FeedCard.displayName = 'FeedCard'
