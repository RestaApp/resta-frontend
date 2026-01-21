import React, { useCallback, useMemo } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { formatDate, formatTime } from '@/utils/datetime'
import { ShiftCard } from '@/features/feed/ui/components/ShiftCard'
import type { Shift } from '@/features/feed/model/types'

interface PersonalShiftCardProps {
    shift: VacancyApiItem
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    isDeleting?: boolean
}

export const PersonalShiftCard: React.FC<PersonalShiftCardProps> = ({ shift, onEdit, onDelete, isDeleting }) => {
    const handleEdit = useCallback((id: number) => onEdit(id), [onEdit])
    const handleDelete = useCallback((id: number) => onDelete(id), [onDelete])

    const dateText = formatDate(shift.start_time)
    const timeText = formatTime(shift.start_time, shift.end_time)

    const pay = useMemo(() => {
        const v = shift.payment ?? shift.hourly_rate ?? 0
        return typeof v === 'string' ? Number(v) : v
    }, [shift.payment, shift.hourly_rate])

    const mappedShift: Shift = useMemo(() => ({
        id: shift.id,
        logo: shift.title?.[0] ?? '🧾',
        restaurant: shift.title || 'Моя смена',
        rating: 0,

        position: shift.position ?? 'chef',
        specialization: shift.specialization ?? null,

        date: dateText,
        time: timeText,

        pay: Number.isFinite(pay) ? pay : 0,
        currency: 'BYN',
        payPeriod: shift.shift_type === 'vacancy' ? 'month' : 'shift',

        location: shift.location ?? undefined,
        urgent: Boolean(shift.urgent),

        applicationId: null,
        ownerId: shift.user?.id ?? null,
        canApply: false,

        isMine: true,
    }), [shift, dateText, timeText, pay])

    return (
        <ShiftCard
            shift={mappedShift}
            onOpenDetails={() => { }}
            onApply={() => { }}
            onCancel={() => { }}
            ownerActions={{ onEdit: handleEdit, onDelete: handleDelete, isDeleting }}
            variant="iconActions"
        />
    )
}

PersonalShiftCard.displayName = 'PersonalShiftCard'
