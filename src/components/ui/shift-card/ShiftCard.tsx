import { memo, useCallback, useMemo, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Shift } from '@/features/feed/model/types'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney, stripMinskPrefix } from '@/features/feed/model/utils/formatting'
import { useCurrentUserId } from '@/features/feed/model/hooks/useCurrentUserId'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ShiftOwnerActions } from '@/components/ui/shift-owner-actions'
import { cn } from '@/utils/cn'
import { splitLocationPoints } from '@/shared/utils/location'
import type { ShiftStatus } from '../StatusPill'
import { toLocalISODateKey } from '@/utils/datetime'

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

const isTodayDateKey = (dateKey?: string | null): boolean => {
  return Boolean(dateKey) && dateKey === toLocalISODateKey(new Date())
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
    const normalized = stripMinskPrefix(shift.location) ?? ''
    const points = splitLocationPoints(normalized)
    return points[0] ?? ''
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
  const isToday = isTodayDateKey(shift.dateKey)
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
      onKeyDown={handleKeyDown}
      onClick={handleOpen}
      className={cn(
        'shift-compact-card group cursor-pointer outline-none transition-all duration-200 active:scale-[0.99] hover:border-[var(--surface-stroke-soft-hover)] focus-visible:ring-2 focus-visible:ring-ring',
        shift.urgent && 'shift-compact-card-sos'
      )}
    >
      <div className="shift-compact-row">
        <div className="min-w-0 flex-1">
          {shift.urgent ? (
            <div className="shift-compact-badge-row">
              <span className="shift-compact-badge">🔥 SOS{isToday ? ' · СЕГОДНЯ' : ''}</span>
            </div>
          ) : null}
          <div className={cn('flex min-w-0 items-start gap-[10px]', shift.urgent && 'gap-0')}>
            {!shift.urgent ? (
              <div className="shift-compact-logo">{positionInitial(shift.position)}</div>
            ) : null}
            <div className="min-w-0 flex-1">
              <h3 className="shift-compact-title line-clamp-2">{compactTitle}</h3>
              <p className="shift-compact-sub truncate">{compactSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right leading-none tabular-nums text-foreground">
          {compactPrice ? (
            <>
              <span className="shift-compact-price font-display">{compactPrice}</span>
              <span className="shift-compact-currency">{shift.currency}</span>
            </>
          ) : (
            <span className="shift-compact-sub font-semibold">{t('shift.payNegotiable')}</span>
          )}
        </div>
      </div>

      <div className="shift-compact-meta min-w-0">
        {compactSchedule ? <span className="shrink-0">⏱ {compactSchedule}</span> : null}
        {locationMeta ? (
          <span className="min-w-[5rem] flex-1 truncate">📍 {locationMeta}</span>
        ) : null}
        {shift.verified ? (
          <span className="shrink-0 rounded-md bg-success/20 px-[7px] py-[2px] font-bold uppercase tracking-[0.12em] text-success">
            VER
          </span>
        ) : null}
        {compactApplications ? (
          <span className="shrink-0 text-muted-foreground">👤 {compactApplications}</span>
        ) : null}
      </div>

      {isOwner && ownerActions ? (
        <div className="mt-3 flex justify-end border-t border-border/40 pt-3">
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
