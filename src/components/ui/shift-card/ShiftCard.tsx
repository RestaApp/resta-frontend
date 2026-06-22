import { memo, useCallback, useMemo } from 'react'
import type { KeyboardEvent } from 'react'
import { AlertTriangle, Clock, Eye, Flame, MapPin, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import type { Shift } from '@/shared/shifts/types'
import { useLabels } from '@/shared/i18n/hooks'
import { useCurrentUserId } from '@/shared/shifts/useCurrentUserId'
import { cn } from '@/shared/utils/cn'
import { firstLocation } from '@/shared/utils/location'
import { addDaysToISODate, toLocalISODateKey } from '@/shared/utils/datetime'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_FALLBACK_CLASS, AVATAR_SM_CLASS } from '@/components/ui/avatar-styles'
import {
  SHIFT_CARD_BADGE_CLASS,
  SHIFT_CARD_BADGE_ROW_CLASS,
  SHIFT_CARD_CLASS,
  SHIFT_CARD_INTERACTIVE_CLASS,
  SHIFT_CARD_META_CLASS,
  SHIFT_CARD_ROW_CLASS,
  SHIFT_CARD_SOS_CLASS,
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { normalizeApplicationStatus } from '@/shared/shifts/applicationStatus'
import { formatDistanceKm, stripVacancyPrefix, positionInitial } from './shift-card-utils'
import { OwnerShiftStatusBadge } from './OwnerShiftStatusBadge'
import { ShiftCardPriceBlock } from './ShiftCardPriceBlock'
import { ShiftCardMetaLine } from './ShiftCardMetaLine'

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
    .replace(/\s*\([^)]*\)/g, '') // убрать "(8 ч.)"
    .replace(/\s*[–-]\s*/g, '–') // нормализовать тире без пробелов
    .trim()
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

  const subcategoryText = useMemo(() => {
    if (shift.specialization) return getSpecializationLabel(shift.specialization)
    return getEmployeePositionLabel(shift.position)
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

  const displayTitle = useMemo(
    () => (shift.title?.trim() || '').slice(0, 80) || null,
    [shift.title]
  )

  const isApplicationCard = !isOwner && Boolean(shift.applicationId)

  const cardAriaLabel = useMemo(
    () =>
      isApplicationCard
        ? [shift.restaurant, subcategoryText, locationText].filter(Boolean).join(', ')
        : [displayTitle, shift.restaurant, positionText, locationText].filter(Boolean).join(', '),
    [displayTitle, isApplicationCard, shift.restaurant, positionText, subcategoryText, locationText]
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

  // Владельцу — отклики и просмотры единообразно: иконка + число, без текста.
  const ownerApplicants =
    isOwner && typeof shift.applicationsCount === 'number' && shift.applicationsCount >= 0
      ? shift.applicationsCount
      : null
  const ownerViews =
    isOwner && typeof shift.viewsCount === 'number' && Number.isFinite(shift.viewsCount)
      ? Math.max(0, Math.floor(shift.viewsCount))
      : null

  // Позиция видна всегда и одинаково (до/после отклика). Есть название →
  // заголовок=название, подзаголовок=позиция•специализация; нет названия →
  // заголовок=позиция, подзаголовок=ресторан (чтобы не дублировать позицию).
  const compactTitle = stripVacancyPrefix(displayTitle ?? positionText)
  const locationMeta = formatDistanceKm(shift.distanceKm) ?? locationText
  const compactSchedule = formatCompactSchedule(shift.date, shift.time)
  const urgentDateTag = getUrgentDateTag(shift.dateKey)
  const avatarFallback = positionInitial(shift.position)
  const compactSubtitle = displayTitle ? positionText : shift.restaurant || ''
  const applicationStatus = isApplicationCard ? (shift.applicationStatus ?? 'pending') : null
  const applicationBadgeVariant = normalizeApplicationStatus(applicationStatus)
  const applicationBadgeLabel = applicationStatus
    ? applicationStatus === 'accepted'
      ? t('activity.statusAcceptedPill')
      : applicationStatus === 'rejected'
        ? t('activity.statusRejectedPill')
        : t('activity.statusPendingPill')
    : null
  const compactApplications =
    !isOwner && typeof shift.applicationsCount === 'number' && shift.applicationsCount > 0
      ? shift.applicationsCount
      : null
  const isOwnerUrgent = isOwner && shift.listingStatus === 'urgent'
  const showSosBadge = !isOwner && shift.urgent
  const showOwnerStatusBadge = isOwner && Boolean(shift.listingStatus)
  const statusTagLabel =
    shift.statusTag === 'expired'
      ? t('activity.statusExpired', { defaultValue: 'Просрочена' })
      : null
  const hasBottomRightMeta =
    Boolean(statusTagLabel) ||
    Boolean(compactApplications) ||
    ownerApplicants != null ||
    ownerViews != null

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
        (isOwnerUrgent || showSosBadge) && SHIFT_CARD_SOS_CLASS
      )}
    >
      <div className={SHIFT_CARD_ROW_CLASS}>
        <div className="min-w-0 flex-1">
          {showSosBadge || applicationBadgeLabel || showOwnerStatusBadge ? (
            <div className={cn(SHIFT_CARD_BADGE_ROW_CLASS, 'flex flex-wrap gap-1.5')}>
              {showSosBadge ? (
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
              {showOwnerStatusBadge && shift.listingStatus ? (
                <OwnerShiftStatusBadge status={shift.listingStatus} />
              ) : null}
            </div>
          ) : null}
          <div className="flex min-w-0 items-start gap-2">
            <Avatar className={AVATAR_SM_CLASS}>
              <AvatarImage src={shift.photoUrl ?? undefined} alt={compactTitle} />
              <AvatarFallback className={AVATAR_FALLBACK_CLASS}>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h3 className={cn(SHIFT_CARD_TITLE_CLASS, 'line-clamp-2')}>{compactTitle}</h3>
              <p className={SHIFT_CARD_SUB_CLASS}>{compactSubtitle}</p>
            </div>
          </div>
        </div>

        <ShiftCardPriceBlock amount={shift.pay} currency={shift.currency} />
      </div>

      <div className={cn(SHIFT_CARD_META_CLASS, 'min-w-0')}>
        {compactSchedule ? (
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock className={ICON_SM_CLASS} aria-hidden />
            {compactSchedule}
          </span>
        ) : null}
        {hasBottomRightMeta ? (
          <span className="ml-auto inline-flex shrink-0 items-center gap-2.5">
            {ownerApplicants != null ? (
              <span
                className="inline-flex items-center gap-1 text-muted-foreground"
                aria-label={t('shift.applicantsLabel', { count: ownerApplicants })}
              >
                <User className={ICON_SM_CLASS} aria-hidden />
                {ownerApplicants}
              </span>
            ) : null}
            {ownerViews != null ? (
              <span
                className="inline-flex items-center gap-1 text-muted-foreground"
                aria-label={t('shift.viewsCount', { count: ownerViews })}
              >
                <Eye className={ICON_SM_CLASS} aria-hidden />
                {ownerViews}
              </span>
            ) : null}
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
      {isOwner && shift.showStaleAlert ? (
        <ShiftCardMetaLine icon={AlertTriangle} className="text-destructive">
          {t('shift.noApplicationsStale')}
        </ShiftCardMetaLine>
      ) : null}
    </div>
  )
}

export const FeedCard = memo(ShiftCardComponent)
FeedCard.displayName = 'FeedCard'
