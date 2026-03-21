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
import { StatusPill, type ShiftStatus } from '../StatusPill'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ShiftOwnerActions } from '@/components/ui/shift-owner-actions'
import { cn } from '@/utils/cn'
import { ShiftCardHeader } from './ShiftCardHeader'
import { ShiftCardMeta } from './ShiftCardMeta'

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
  variant?: 'default' | 'supplier'
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
  variant = 'default',
  onOpenDetails,
  onApply,
  onCancel,
  isLoading = false,
  ownerActions,
}: ShiftCardProps) => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()
  const currentUserId = useCurrentUserId()
  const selectedRole = useAppSelector(selectSelectedRole)
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

  const locationText = useMemo(() => stripMinskPrefix(shift.location) ?? '', [shift.location])
  const hasDate = Boolean(shift.date?.trim())
  const hasTime = Boolean(shift.time?.trim())
  const isVacancyCard = shift.shiftType === 'vacancy' || shift.payPeriod === 'month'

  /** Одна строка: компания · место (для единого шаблона смены/вакансии) */
  const companyPlaceLine = useMemo(() => {
    const parts = [shift.restaurant]
    if (!isSupplierVariant && locationText) parts.push(locationText)
    return parts.join(' · ')
  }, [shift.restaurant, isSupplierVariant, locationText])

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
        <span className="text-sm font-normal text-muted-foreground">{shift.currency}</span>
      </>
    )
  }, [shift.pay, shift.currency, t])

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

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    ownerActions?.onDelete(shift.id)
    setConfirmOpen(false)
  }, [ownerActions, shift.id])

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
    if (shouldHideOwnerMetaForVenue) return false
    if (isVacancyCard) return Boolean(locationText)
    return hasDate || hasTime
  }, [shouldHideOwnerMetaForVenue, isVacancyCard, locationText, hasDate, hasTime])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={cardAriaLabel}
      onKeyDown={handleKeyDown}
      onClick={handleOpen}
      className={cn(
        'group relative rounded-xl p-4 border bg-card transition-all duration-200 cursor-pointer active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'border-[var(--surface-stroke-soft)] hover:border-[var(--surface-stroke-soft-hover)] active:border-[var(--surface-stroke-soft-hover)] dark:shadow-none',
        shift.urgent &&
          'border-primary/25 hover:border-primary/35 dark:!border-primary/25 dark:hover:border-primary/35 dark:[box-shadow:var(--primary-ring-soft)] dark:hover:[box-shadow:var(--primary-ring-soft-hover)]',
        !shift.urgent && 'shadow-sm hover:[box-shadow:var(--surface-shadow-soft)]'
      )}
    >
      <ShiftCardHeader
        shift={shift}
        displayTitle={displayTitle}
        positionText={positionText}
        priceContent={priceContent}
        hidePrice={isSupplierVariant}
      />

      <ShiftCardMeta
        positionText={positionText}
        companyPlaceLine={companyPlaceLine}
        shouldHideOwnerMetaForVenue={shouldHideOwnerMetaForVenue}
        shouldShowMetaRow={shouldShowMetaRow}
        isVacancyCard={isVacancyCard}
        locationText={locationText}
        hasDate={hasDate}
        hasTime={hasTime}
        date={shift.date}
        time={shift.time}
      />

      {!isSupplierVariant ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            {applicationStatus != null ? <StatusPill status={applicationStatus} /> : null}
            {responses ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums border',
                  responses.hasResponses
                    ? 'border-primary/25 bg-primary/5 text-primary dark:bg-primary/10'
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
              variant={isApplied ? 'outline' : 'gradient'}
              loading={isLoading}
              onClick={isApplied ? handleCancelClick : handleApplyClick}
              disabled={isLoading || (!canApply && !isApplied)}
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
