import React, { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Shift } from '@/features/feed/model/types'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney, stripMinskPrefix } from '@/features/feed/model/utils/formatting'
import { useCurrentUserId } from '@/features/feed/model/hooks/useCurrentUserId'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole } from '@/features/navigation/model/userSlice'
import { getRoleTheme } from '@/shared/lib/role-theme'
import { StatusPill, DirectPayBadge, type ShiftStatus } from '../StatusPill'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ShiftOwnerActions } from '@/components/ui/shift-owner-actions'
import { cn } from '@/utils/cn'
import { splitLocationPoints } from '@/shared/utils/location'
import { ShiftCardHeader } from './ShiftCardHeader'
import { ShiftCardMeta } from './ShiftCardMeta'
import { isEmployeeRole } from '@/utils/roles'
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
  variant?: 'default' | 'supplier'
  onOpenDetails: (id: number) => void
  onOpenRestaurant?: (restaurantId: number) => void
  onApply: (id: number) => void
  onCancel: (applicationId: number | null | undefined, shiftId: number) => void
  isLoading?: boolean
  ownerActions?: ShiftCardOwnerActions
}

const ShiftCardComponent = ({
  shift,
  isApplied = false,
  applicationId = null,
  applicationStatus = null,
  variant = 'default',
  onOpenDetails,
  onOpenRestaurant,
  onApply,
  onCancel,
  isLoading = false,
  ownerActions,
}: ShiftCardProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()
  const currentUserId = useCurrentUserId()
  const selectedRole = useAppSelector(selectSelectedRole)
  const isEmployeeCard = isEmployeeRole(selectedRole)
  const accentRole = getRoleTheme(selectedRole ?? 'employee')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isOwner = useMemo(
    () => shift.isMine === true || Boolean(shift.ownerId && shift.ownerId === currentUserId),
    [shift.isMine, shift.ownerId, currentUserId]
  )

  const isAccepted = applicationStatus === 'accepted'
  const isRejected = applicationStatus === 'rejected'

  const positionText = useMemo(() => {
    const position = getEmployeePositionLabel(shift.position)
    const specialization = shift.specialization
      ? ` • ${getSpecializationLabel(shift.specialization)}`
      : ''
    return `${position}${specialization}`
  }, [shift.position, shift.specialization, getEmployeePositionLabel, getSpecializationLabel])

  // simplified card: period label moved to details modal
  const canShowApply = !isOwner && !isAccepted && !isRejected
  const canApply = shift.canApply !== false
  const isSupplierVariant = variant === 'supplier'

  const { locationText, extraLocationsCount } = useMemo(() => {
    const normalized = stripMinskPrefix(shift.location) ?? ''
    const points = splitLocationPoints(normalized)
    if (points.length === 0) return { locationText: '', extraLocationsCount: 0 }
    return {
      locationText: points[0],
      extraLocationsCount: Math.max(points.length - 1, 0),
    }
  }, [shift.location])
  const hasDate = Boolean(shift.date?.trim())
  const hasTime = Boolean(shift.time?.trim())
  const isVacancyCard = shift.shiftType === 'vacancy' || shift.payPeriod === 'month'

  const displayTitle = useMemo(
    () => (shift.title?.trim() || '').slice(0, 80) || null,
    [shift.title]
  )

  const priceContent = useMemo(() => {
    if (shift.pay == null || Number(shift.pay) === 0) {
      return t('shift.payNegotiable')
    }

    return (
      <>
        {formatMoney(shift.pay)}{' '}
        <span className="font-mono-resta text-micro font-medium tracking-normal text-muted-foreground">
          {shift.currency}
        </span>
      </>
    )
  }, [shift.pay, shift.currency, t])

  const cardAriaLabel = useMemo(
    () => [displayTitle, shift.restaurant, positionText, locationText].filter(Boolean).join(', '),
    [displayTitle, shift.restaurant, positionText, locationText]
  )

  const handleOpen = useCallback(() => onOpenDetails(shift.id), [onOpenDetails, shift.id])
  const handleOpenRestaurant = useCallback(() => {
    if (!onOpenRestaurant || typeof shift.ownerId !== 'number') return
    onOpenRestaurant(shift.ownerId)
  }, [onOpenRestaurant, shift.ownerId])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleOpen()
      }
    },
    [handleOpen]
  )

  const handleApplyClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isOwner) return
      onApply(shift.id)
    },
    [isOwner, onApply, shift.id]
  )

  const handleCancelClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isOwner) return
      onCancel(applicationId ?? shift.applicationId ?? null, shift.id)
    },
    [isOwner, onCancel, applicationId, shift.applicationId, shift.id]
  )

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      ownerActions?.onEdit(shift.id)
    },
    [ownerActions, shift.id]
  )

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmOpen(true)
  }

  const confirmDelete = () => {
    ownerActions?.onDelete(shift.id)
    setConfirmOpen(false)
  }

  const actionLabel = useMemo(() => {
    if (isLoading) return isApplied ? t('shift.cancelling') : t('shift.sending')
    return isApplied ? t('shift.cancelApplication') : t('shift.apply')
  }, [isLoading, isApplied, t])

  const responses = useMemo(() => {
    if (!isOwner) return null
    const countRaw = shift.applicationsCount
    const count = typeof countRaw === 'number' && Number.isFinite(countRaw) ? countRaw : 0
    return { count, hasResponses: count > 0 }
  }, [isOwner, shift.applicationsCount])

  const shouldHideOwnerMetaForVenue = isOwner && selectedRole === 'venue'
  const shouldShowMetaRow = useMemo(() => {
    if (isVacancyCard) return !isOwner && Boolean(locationText)
    if (isEmployeeCard) return hasTime || Boolean(locationText)
    return hasDate || hasTime
  }, [isVacancyCard, isOwner, locationText, hasDate, hasTime, isEmployeeCard])

  if (!isSupplierVariant) {
    const compactTitle = stripVacancyPrefix(displayTitle ?? positionText)
    const locationMeta = formatDistanceKm(shift.distanceKm) ?? locationText
    const compactSchedule = formatCompactSchedule(shift.date, shift.time)
    const compactPrice =
      shift.pay == null || Number(shift.pay) === 0 ? null : formatMoney(shift.pay)
    const isToday = isTodayDateKey(shift.dateKey)
    const compactSubtitle =
      isVacancyCard || !positionText ? shift.restaurant : `${shift.restaurant} · ${positionText}`
    const compactApplications = responses?.hasResponses
      ? responses.count
      : typeof shift.applicationsCount === 'number' && shift.applicationsCount > 0
        ? shift.applicationsCount
        : null

    return (
      <>
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
      </>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={cardAriaLabel}
      onKeyDown={handleKeyDown}
      onClick={handleOpen}
      className={cn(
        'group relative cursor-pointer rounded-lg border p-4 outline-none transition-all duration-200 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring',
        'hover:border-[var(--surface-stroke-soft-hover)] active:border-[var(--surface-stroke-soft-hover)] dark:shadow-none',
        !isSupplierVariant && accentRole.classes.shiftCardGradient,
        isSupplierVariant && 'border-border/80 bg-card ',
        !isSupplierVariant &&
          (shift.urgent
            ? cn('border-2 ', accentRole.classes.border, accentRole.classes.bgSurface)
            : 'border border-border/60 '),
        !shift.urgent && !isSupplierVariant && 'hover:[box-shadow:var(--surface-shadow-soft)]'
      )}
    >
      <ShiftCardHeader
        shift={shift}
        displayTitle={displayTitle}
        positionText={positionText}
        priceContent={priceContent}
        hidePrice={isSupplierVariant}
        isEmployeeCard={isEmployeeCard}
        accentRole={accentRole}
      />

      <ShiftCardMeta
        positionText={positionText}
        restaurantName={shift.restaurant}
        locationText={locationText}
        extraLocationsCount={extraLocationsCount}
        onOpenRestaurant={handleOpenRestaurant}
        shouldHideOwnerMetaForVenue={shouldHideOwnerMetaForVenue}
        shouldShowMetaRow={shouldShowMetaRow}
        isVacancyCard={isVacancyCard}
        hasDate={hasDate}
        hasTime={hasTime}
        date={shift.date}
        time={shift.time}
        isEmployeeCard={isEmployeeCard}
        accentRole={accentRole}
      />

      {!isSupplierVariant ? <div className="my-3 h-px w-full bg-border/55" aria-hidden /> : null}

      {!isSupplierVariant ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            {isEmployeeCard ? null : applicationStatus != null ? (
              <StatusPill status={applicationStatus} />
            ) : null}
            {shift.escrow ? (
              <DirectPayBadge
                amount={shift.escrowAmount ?? shift.pay}
                currency={shift.currency}
                short
              />
            ) : null}
            {isEmployeeCard && shift.verified ? (
              <span className="font-mono-resta text-xs font-semibold tracking-wide text-success">
                ✓ VERIFIED
              </span>
            ) : null}
            {responses ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums',
                  responses.hasResponses
                    ? cn(
                        accentRole.classes.border,
                        accentRole.classes.bgSurface,
                        accentRole.classes.text
                      )
                    : 'border-border bg-muted/40 text-muted-foreground'
                )}
              >
                {responses.hasResponses ? (
                  <>
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('shift.responsesCountLabel')}</span>
                    <span className="font-bold">{responses.count}</span>
                  </>
                ) : (
                  t('shift.noResponses')
                )}
              </span>
            ) : null}
          </div>

          {isOwner && ownerActions ? (
            <ShiftOwnerActions
              editLabel={t('common.edit')}
              deleteLabel={t('common.delete')}
              isDeleting={ownerActions.isDeleting}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : null}

          {!isOwner && canShowApply ? (
            <Button
              variant={isApplied ? 'outline' : 'ghost'}
              loading={isLoading}
              onClick={isApplied ? handleCancelClick : handleApplyClick}
              disabled={isLoading || (!canApply && !isApplied)}
              className={
                isApplied
                  ? undefined
                  : cn(
                      'border-0 font-semibold ',
                      accentRole.classes.bg,
                      accentRole.classes.textOn,
                      accentRole.classes.solidHover,
                      accentRole.classes.ring
                    )
              }
            >
              {actionLabel}
            </Button>
          ) : null}
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

export const ShiftCard = memo(ShiftCardComponent)
ShiftCard.displayName = 'ShiftCard'
