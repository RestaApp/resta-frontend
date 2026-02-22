import React, { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Shift } from '@/features/feed/model/types'
import { useLabels } from '@/shared/i18n/hooks'
import { formatMoney, stripMinskPrefix } from '@/features/feed/model/utils/formatting'
import { useCurrentUserId } from '@/features/feed/model/hooks/useCurrentUserId'
import { StatusPill, UrgentPill, type ShiftStatus } from './StatusPill'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ShiftOwnerActions } from '@/components/ui/shift-owner-actions'
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
      ? ` • ${getSpecializationLabel(shift.specialization)}`
      : ''
    return `${position}${specialization}`
  }, [shift.position, shift.specialization, getEmployeePositionLabel, getSpecializationLabel])

  // simplified card: period label moved to details modal
  const canShowApply = !isOwner && !isAccepted && !isRejected
  const canApply = shift.canApply !== false

  const locationText = useMemo(() => stripMinskPrefix(shift.location) ?? '', [shift.location])

  const cardAriaLabel = useMemo(
    () => [shift.restaurant, positionText, locationText].filter(Boolean).join(', '),
    [shift.restaurant, positionText, locationText]
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

  const responsesLabel = useMemo(() => {
    if (!isOwner) return null
    const countRaw = shift.applicationsCount
    const count = typeof countRaw === 'number' && Number.isFinite(countRaw) ? countRaw : 0
    return count > 0 ? t('shift.responsesCount', { count }) : t('shift.noResponses')
  }, [isOwner, shift.applicationsCount, t])

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
      {/* Header */}
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex gap-3 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted/60 flex items-center justify-center text-2xl border border-border/50">
            {shift.logo}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base leading-tight truncate">{positionText}</h3>

              {shift.rating > 0 ? (
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  ★ {shift.rating}
                </div>
              ) : null}
            </div>

            <p className="text-sm text-muted-foreground mt-0.5 truncate">{shift.restaurant}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {shift.urgent ? <UrgentPill /> : null}
              {applicationStatus != null ? <StatusPill status={applicationStatus} /> : null}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div
            className={cn(
              'font-semibold text-lg text-primary tracking-tight',
              shift.urgent && 'dark:font-bold dark:text-[1.0625rem]'
            )}
          >
            {formatMoney(shift.pay)}{' '}
            <span className="text-sm font-normal text-muted-foreground">{shift.currency}</span>
          </div>
        </div>
      </div>

      {/* Date / time — текст + иконка, без капсул */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5 truncate">
          <CalendarDays className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span className="font-medium text-foreground truncate">{shift.date}</span>
        </span>
        <span className="flex items-center gap-1.5 truncate">
          <Clock className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span className="font-medium text-foreground truncate">{shift.time}</span>
        </span>
      </div>

      {/* Bottom */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {responsesLabel ? (
            <span
              className={cn(
                'text-xs',
                hasResponses ? 'font-medium text-primary' : 'text-muted-foreground'
              )}
            >
              {responsesLabel}
            </span>
          ) : null}
        </div>

        {/* Owner actions */}
        {isOwner && ownerActions ? (
          <ShiftOwnerActions
            editLabel={t('common.edit')}
            deleteLabel={t('common.delete')}
            isDeleting={ownerActions.isDeleting}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : null}

        {/* Apply / Cancel */}
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
