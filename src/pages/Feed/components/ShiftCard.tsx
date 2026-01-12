import React, { memo, useMemo, useCallback } from 'react'
import { MapPin, Clock, CalendarDays } from 'lucide-react'
import { ActionButton } from '@/components/ui/ActionButton'
import type { Shift } from '../types'
import { getEmployeePositionLabel, getSpecializationLabel } from '@/constants/labels'
import { formatMoney, stripMinskPrefix } from '../utils/formatting'
import { useCurrentUserId } from '../hooks/useCurrentUserId'

interface ShiftCardProps {
    shift: Shift
    isApplied?: boolean
    applicationId?: number | null
    applicationStatus?: string | null
    onOpenDetails: (id: number) => void
    onApply: (id: number) => void
    onCancel: (applicationId: number | null | undefined, shiftId: number) => void
    isLoading?: boolean
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
}: ShiftCardProps) => {
    const currentUserId = useCurrentUserId()

    const isOwner = useMemo(() => {
        if (!shift.ownerId) return false
        return shift.ownerId === currentUserId
    }, [shift.ownerId, currentUserId])

    const positionText = useMemo(() => {
        const position = getEmployeePositionLabel(shift.position)
        const specialization = shift.specialization ? ` • ${getSpecializationLabel(shift.specialization)}` : ''
        return `${position}${specialization}`
    }, [shift.position, shift.specialization])

    const payLabel = useMemo(() => {
        const period = shift.payPeriod === 'month' ? 'за месяц' : 'за смену'
        return period
    }, [shift.payPeriod])

    const actionLabel = useMemo(() => {
        if (isLoading) return isApplied ? 'Отмена…' : 'Отправка…'
        return isApplied ? 'Отменить заявку' : 'Откликнуться'
    }, [isLoading, isApplied])

    const isConfirmed = applicationStatus === 'accepted'

    const handleOpen = useCallback(() => {
        onOpenDetails(shift.id)
    }, [onOpenDetails, shift.id])

    const handleAction = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            if (isOwner) return

            if (isApplied) {
                onCancel(applicationId ?? shift.applicationId ?? null, shift.id)
            } else {
                onApply(shift.id)
            }
        },
        [isOwner, isApplied, onCancel, onApply, applicationId, shift.applicationId, shift.id]
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleOpen()
            }
        },
        [handleOpen]
    )

    const locationText = useMemo(() => stripMinskPrefix(shift.location) ?? '', [shift.location])

    return (
        <div
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={handleOpen}
            className="group relative rounded-[20px] p-4 shadow-sm border border-border/50 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] backdrop-blur-xl bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            {/* Верх: Лого + инфо + цена */}
            <div className="flex justify-between items-start mb-4 gap-3">
                <div className="flex gap-3 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/10">
                        {shift.logo}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base leading-tight truncate">{positionText}</h3>
                            <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                                ★ {shift.rating}
                            </div>
                            {shift.urgent ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                                    Срочно
                                </span>
                            ) : null}
                        </div>

                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{shift.restaurant}</p>
                    </div>
                </div>

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

            {/* Дата / время */}
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

            {/* Низ: адрес + CTA */}
            <div className="flex items-center justify-between gap-2">
                {locationText ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground flex-1 min-w-0">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-foreground/40" />
                        <span className="text-xs truncate font-medium">{locationText}</span>
                    </div>
                ) : (
                    <div className="flex-1" />
                )}

                {!isOwner ? (
                    isApplied && isConfirmed ? (
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 text-xs rounded-full bg-blue-600 text-white font-medium">Подтверждена</span>
                        </div>
                    ) : (
                        <ActionButton
                            isLoading={isLoading}
                            active={isApplied}
                            onClick={handleAction}
                            disabled={isLoading || shift.canApply === false}
                        >
                            {shift.canApply === false && !isApplied ? 'Недоступно' : actionLabel}
                        </ActionButton>
                    )
                ) : null}
            </div>
        </div>
    )
}

export const ShiftCard = memo(ShiftCardComponent)
ShiftCard.displayName = 'ShiftCard'
