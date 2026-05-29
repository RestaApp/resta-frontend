import { memo, useCallback, useMemo, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Shift } from '@/features/feed/model/types'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney } from '@/features/feed/model/utils/formatting'
import { useCurrentUserId } from '@/features/feed/model/hooks/useCurrentUserId'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ShiftOwnerActions } from '@/components/ui/shift-owner-actions'
import { cn } from '@/utils/cn'
import { firstLocation } from '@/shared/utils/location'
import type { ShiftStatus } from '../StatusPill'
import { addDaysToISODate, toLocalISODateKey } from '@/utils/datetime'
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

interface ShiftCardOwnerActions {
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isDeleting?: boolean
}

const formatDistanceKm = (distanceKm?: number | null): string | null => {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm <= 0) return null
  const rounded = distanceKm < 10 ? Math.round(distanceKm * 10) / 10 : Math.round(distanceKm)
  return `${rounded} км`
}

const stripVacancyPrefix = (title: string): string => {
  return title
    .replace(/^вакансия:\s*/i, '')
    .replace(/^(?:\s|🔥)+/u, '')
    .trim()
}

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

const positionInitial = (position: string): string => {
  const normalized = position.trim().toLowerCase()
  if (normalized === 'chef') return 'C'
  return (normalized[0] ?? 'R').toUpperCase()
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
  isApplied?: boolean
  applicationId?: number | null
  applicationStatus?: ShiftStatus
  onOpenDetails: (id: number) => void
  onOpenRestaurant?: (restaurantId: number) => void
  onApply: (id: number) => void
  onCancel: (applicationId: number | null | undefined, shiftId: number) => void
  isLoading?: boolean
  ownerActions?: ShiftCardOwnerActions
}
export type FeedCardProps = ShiftCardProps

const ShiftCardComponent = ({ shift, onOpenDetails, ownerActions }: ShiftCardProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()
  const currentUserId = useCurrentUserId()
  const [confirmOpen, setConfirmOpen] = useState(false)

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
    if (!first) return ''
    return first.replace(/^Минск,\s*/i, '')
  }, [shift.location])

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

  const handleEdit = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      ownerActions?.onEdit(shift.id)
    },
    [ownerActions, shift.id]
  )

  const handleDelete = (event: MouseEvent) => {
    event.stopPropagation()
    setConfirmOpen(true)
  }

  const confirmDelete = () => {
    ownerActions?.onDelete(shift.id)
    setConfirmOpen(false)
  }

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
  const compactApplications = responses?.hasResponses
    ? responses.count
    : typeof shift.applicationsCount === 'number' && shift.applicationsCount > 0
      ? shift.applicationsCount
      : null

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
          {shift.urgent ? (
            <div className={SHIFT_CARD_BADGE_ROW_CLASS}>
              <span className={SHIFT_CARD_BADGE_CLASS}>
                🔥 SOS{urgentDateTag ? ` · ${urgentDateTag}` : ''}
              </span>
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
        {compactSchedule ? <span className="shrink-0">⏱ {compactSchedule}</span> : null}
        {locationMeta ? <span className="min-w-20 flex-1 truncate">📍 {locationMeta}</span> : null}
        {compactApplications ? (
          <span className="shrink-0 text-muted-foreground">👤 {compactApplications}</span>
        ) : null}
      </div>

      {isOwner && ownerActions ? (
        <div className="flex justify-end border-t border-border/40 pt-3">
          <ShiftOwnerActions
            editLabel={t('common.edit')}
            deleteLabel={t('common.delete')}
            isDeleting={ownerActions.isDeleting}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('shift.deleteConfirmTitle')}
        description={t('shift.deleteConfirmDesc')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('common.delete')}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export const FeedCard = memo(ShiftCardComponent)
FeedCard.displayName = 'FeedCard'
export const ShiftCard = FeedCard
