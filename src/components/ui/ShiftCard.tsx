import React, { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, CalendarDays, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Shift } from '@/features/feed/model/types'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney, stripMinskPrefix } from '@/features/feed/model/utils/formatting'
import { useCurrentUserId } from '@/features/feed/model/hooks/useCurrentUserId'
import { StatusPill, UrgentPill, type ShiftStatus } from './StatusPill'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ShiftOwnerActions } from '@/components/ui/shift-owner-actions'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'

interface ShiftCardOwnerActions {
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isDeleting?: boolean
}

export interface ShiftCardProps {
  shift: Shift
  isApplied?: boolean
  applicationId?: number | null
  applicationStatus?: ShiftStatus
  onOpenDetails: (id: number) => void
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
  onOpenDetails,
  onApply,
  onCancel,
  isLoading = false,
  ownerActions,
}: ShiftCardProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()
  const currentUserId = useCurrentUserId()
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
      ? `, ${getSpecializationLabel(shift.specialization)}`
      : ''
    return `${position}${specialization}`
  }, [shift.position, shift.specialization, getEmployeePositionLabel, getSpecializationLabel])

  // simplified card: period label moved to details modal
  const canShowApply = !isOwner && !isAccepted && !isRejected
  const canApply = shift.canApply !== false

  const locationText = useMemo(() => stripMinskPrefix(shift.location) ?? '', [shift.location])

  /** Одна строка: компания · место (для единого шаблона смены/вакансии) */
  const companyPlaceLine = useMemo(() => {
    const parts = [shift.restaurant]
    if (locationText) parts.push(locationText)
    return parts.join(' · ')
  }, [shift.restaurant, locationText])

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

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setConfirmOpen(true)
    },
    [ownerActions, shift.id]
  )

  const confirmDelete = useCallback(() => {
    ownerActions?.onDelete(shift.id)
    setConfirmOpen(false)
  }, [ownerActions, shift.id])

  const actionLabel = useMemo(() => {
    if (isLoading) return isApplied ? t('shift.cancelling') : t('shift.sending')
    return isApplied ? t('shift.cancelApplication') : t('shift.apply')
  }, [isLoading, isApplied, t])

  const responsesText = useMemo(() => {
    if (!isOwner) return null
    const countRaw = shift.applicationsCount
    const count = typeof countRaw === 'number' && Number.isFinite(countRaw) ? countRaw : 0
    return { count, hasResponses: count > 0 }
  }, [isOwner, shift.applicationsCount])

  const hasResponses = useMemo(() => {
    const countRaw = shift.applicationsCount
    const count = typeof countRaw === 'number' && Number.isFinite(countRaw) ? countRaw : 0
    return isOwner && count > 0
  }, [isOwner, shift.applicationsCount])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={cardAriaLabel}
      onKeyDown={handleKeyDown}
      onClick={handleOpen}
      className={cn(
        'group relative rounded-xl p-4 border bg-card transition-all duration-200 cursor-pointer active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'dark:border-[rgba(255,255,255,0.06)] dark:hover:border-[rgba(255,255,255,0.10)] dark:active:border-[rgba(255,255,255,0.10)] dark:shadow-none',
        shift.urgent &&
        'border-primary/25 hover:border-primary/35 dark:!border-primary/25 dark:hover:border-primary/35 dark:shadow-[0_0_0_1px_rgba(147,51,234,0.12)] dark:hover:shadow-[0_0_0_1px_rgba(147,51,234,0.18)]',
        !shift.urgent && 'border-border shadow-sm hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
      )}
    >
      {/* 1. Header: иконка/фото + Title (1 строка) + Price (справа) */}
      <div className="flex justify-between items-start gap-3 mb-1.5">
        <div className="flex gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted/60 flex items-center justify-center text-2xl border border-border/50 overflow-hidden">
            {shift.userPhotoUrl ? (
              <Avatar className="w-12 h-12 rounded-lg">
                <AvatarImage src={shift.userPhotoUrl} alt="" />
                <AvatarFallback className="rounded-lg bg-muted/60 text-2xl">
                  {shift.logo}
                </AvatarFallback>
              </Avatar>
            ) : (
              shift.logo
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base leading-tight truncate">
              {displayTitle ?? positionText}
            </h3>
            {shift.urgent ? (
              <div className="mt-1">
                <UrgentPill />
              </div>
            ) : null}
            {displayTitle != null && shift.rating > 0 ? (
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mt-0.5">
                ★ {shift.rating}
              </div>
            ) : null}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span
            className={cn(
              'font-semibold text-lg text-primary tracking-tight',
              shift.urgent && 'dark:font-bold dark:text-[1.0625rem]'
            )}
          >
            {shift.pay == null || Number(shift.pay) === 0 ? (
              t('shift.payNegotiable')
            ) : (
              <>
                {formatMoney(shift.pay)}{' '}
                <span className="text-sm font-normal text-muted-foreground">{shift.currency}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 2. Subheader: Role / Category */}
      <p className="text-sm text-muted-foreground truncate mb-1">
        {positionText}
      </p>

      {/* 3. Company / Place (1 строка) */}
      <p className="text-sm text-muted-foreground truncate mb-2">
        {companyPlaceLine}
      </p>

      {/* 4. Meta-row: 2–3 пункта с иконками (смена: дата + время; вакансия: место) */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 min-h-[1.25rem]">
        {shift.shiftType === 'vacancy' ? (
          <span className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="font-medium text-foreground truncate">{locationText || '—'}</span>
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1.5 min-w-0">
              <CalendarDays className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="font-medium text-foreground truncate">{shift.date}</span>
            </span>
            <span className="flex items-center gap-1.5 min-w-0">
              <Clock className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="font-medium text-foreground truncate">{shift.time}</span>
            </span>
          </>
        )}
      </div>

      {/* 5. Footer: Status chip (слева) + CTA (справа) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          {applicationStatus != null ? <StatusPill status={applicationStatus} /> : null}
          {responsesText ? (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums border',
                hasResponses
                  ? 'border-primary/25 bg-primary/5 text-primary dark:bg-primary/10'
                  : 'border-border bg-muted/40 text-muted-foreground'
              )}
            >
              {responsesText.hasResponses ? (
                <>
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('shift.responsesCountLabel')}</span>
                  <span className="font-bold">{responsesText.count}</span>
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
            variant={isApplied ? 'outline' : 'gradient'}
            loading={isLoading}
            onClick={isApplied ? handleCancelClick : handleApplyClick}
            disabled={isLoading || (!canApply && !isApplied)}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
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
