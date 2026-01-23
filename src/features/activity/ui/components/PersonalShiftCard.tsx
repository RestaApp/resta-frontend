import React, { useCallback, useMemo } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { ShiftCard } from '@/components/ui/ShiftCard'
import type { Shift } from '@/features/feed/model/types'
import { parseApiDateTime, formatDateRU, formatTimeRangeRU } from '@/features/feed/model/utils/formatting'

interface PersonalShiftCardProps {
    shift: VacancyApiItem
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    isDeleting?: boolean
}

export const PersonalShiftCard: React.FC<PersonalShiftCardProps> = ({ shift, onEdit, onDelete, isDeleting }) => {
    const handleEdit = useCallback((id: number) => onEdit(id), [onEdit])
    const handleDelete = useCallback((id: number) => onDelete(id), [onDelete])

    // Используем parseApiDateTime для корректного парсинга формата API
    const start = parseApiDateTime(shift.start_time ?? undefined)
    const end = parseApiDateTime(shift.end_time ?? undefined)

    const dateText = start ? formatDateRU(start) : ''
    const timeText = start && end ? formatTimeRangeRU(start, end) : start ? formatTimeRangeRU(start, start) : ''

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
        />
    )
}

PersonalShiftCard.displayName = 'PersonalShiftCard'
