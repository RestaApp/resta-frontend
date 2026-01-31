import React, { memo, useCallback, useMemo } from 'react'
import { MapPin, Clock, CalendarDays, Edit2, Trash2 } from 'lucide-react'
import { ActionButton } from '@/components/ui/action-button'
import type { Shift } from '@/features/feed/model/types'
import { getEmployeePositionLabel, getSpecializationLabel } from '@/constants/labels'
import { formatMoney, stripMinskPrefix } from '@/features/feed/model/utils/formatting'
import { useCurrentUserId } from '@/features/feed/model/hooks/useCurrentUserId'
import { StatusPill, UrgentPill, type ShiftStatus } from './StatusPill'

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

const IconAction = memo(function IconAction({
    title,
    onClick,
    disabled,
    children,
}: {
    title: string
    onClick: (e: React.MouseEvent) => void
    disabled?: boolean
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
            {children}
        </button>
    )
})

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
    const currentUserId = useCurrentUserId()

    const isOwner = useMemo(
        () => shift.isMine === true || Boolean(shift.ownerId && shift.ownerId === currentUserId),
        [shift.isMine, shift.ownerId, currentUserId]
    )

    const isAccepted = applicationStatus === 'accepted'
    const isRejected = applicationStatus === 'rejected'

    const positionText = useMemo(() => {
        const position = getEmployeePositionLabel(shift.position)
        const specialization = shift.specialization ? ` • ${getSpecializationLabel(shift.specialization)}` : ''
        return `${position}${specialization}`
    }, [shift.position, shift.specialization])

    const payLabel = shift.payPeriod === 'month' ? 'за месяц' : 'за смену'
    const canShowApply = !isOwner && !isAccepted && !isRejected
    const canApply = shift.canApply !== false

    const locationText = useMemo(() => stripMinskPrefix(shift.location) ?? '', [shift.location])

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
            ownerActions?.onDelete(shift.id)
        },
        [ownerActions, shift.id]
    )

    const actionLabel = useMemo(() => {
        if (isLoading) return isApplied ? 'Отмена…' : 'Отправка…'
        return isApplied ? 'Отменить заявку' : 'Откликнуться'
    }, [isLoading, isApplied])

    return (
        <div
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={handleOpen}
            className="group relative rounded-[20px] p-4 shadow-sm border border-border/50 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] backdrop-blur-xl bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 gap-3">
                <div className="flex gap-3 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/10">
                        {shift.logo}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base leading-tight truncate">{positionText}</h3>

                            {shift.rating > 0 ? (
                                <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                                    ★ {shift.rating}
                                </div>
                            ) : null}
                        </div>

                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{shift.restaurant}</p>

                        {/* Pills row */}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {shift.urgent ? <UrgentPill /> : null}
                            {applicationStatus != null ? <StatusPill status={applicationStatus} /> : null}
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg text-primary tracking-tight">
                        {formatMoney(shift.pay)}{' '}
                        <span className="text-sm font-normal text-muted-foreground">{shift.currency}</span>
                    </div>

                    <div className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md inline-block">
                        {payLabel}
                    </div>
                </div>
            </div>

            {/* Date / time */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-foreground/80 bg-secondary/30 p-2 rounded-xl">
                    <CalendarDays className="w-4 h-4 text-purple-500" />
                    <span className="font-medium truncate">{shift.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80 bg-secondary/30 p-2 rounded-xl">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium truncate">{shift.time}</span>
                </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center justify-between gap-2">
                {locationText ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground flex-1 min-w-0">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-foreground/40" />
                        <span className="text-xs truncate font-medium">{locationText}</span>
                    </div>
                ) : (
                    <div className="flex-1" />
                )}

                {/* Owner actions */}
                {isOwner && ownerActions ? (
                    <div className="flex items-center gap-2">
                        <IconAction title="Изменить" onClick={handleEdit} disabled={ownerActions.isDeleting}>
                            <Edit2 className="w-4 h-4" />
                        </IconAction>
                        <IconAction title="Удалить" onClick={handleDelete} disabled={ownerActions.isDeleting}>
                            <Trash2 className="w-4 h-4" />
                        </IconAction>
                    </div>
                ) : null}

                {/* Apply / Cancel */}
                {!isOwner && canShowApply ? (
                    <ActionButton
                        isLoading={isLoading}
                        active={isApplied}
                        onClick={isApplied ? handleCancelClick : handleApplyClick}
                        disabled={isLoading || (!canApply && !isApplied)}
                    >
                        {actionLabel}
                    </ActionButton>
                ) : null}
            </div>
        </div>
    )
}

export const ShiftCard = memo(ShiftCardComponent)
ShiftCard.displayName = 'ShiftCard'
