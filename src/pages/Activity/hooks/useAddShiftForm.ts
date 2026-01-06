import { useCallback, useMemo, useState } from 'react'
import { useCreateShiftMutation, type CreateShiftResponse } from '@/services/api/shiftsApi'
import { useToast } from '@/hooks/useToast'
import { toMinutes, buildDateTime } from '@/utils/date'

export type ShiftType = 'vacancy' | 'replacement'

type UseAddShiftFormOptions = {
    initialShiftType?: ShiftType | null
    onSave?: (shift: CreateShiftResponse | null) => void
}

export const useAddShiftForm = ({ initialShiftType = 'vacancy', onSave }: UseAddShiftFormOptions = {}) => {
    const { showToast } = useToast()
    const [createShift, { isLoading: isCreating }] = useCreateShiftMutation()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState<string | null>(null)
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [pay, setPay] = useState('')
    const [location, setLocation] = useState('')
    const [requirements, setRequirements] = useState('')
    const [shiftType, setShiftType] = useState<ShiftType>(initialShiftType ?? 'vacancy')
    const [urgent, setUrgent] = useState(false)
    const [position, setPosition] = useState('')
    const [specialization, setSpecialization] = useState('')
    const [submitError, setSubmitError] = useState<string | null>(null)

    const timeRangeError = useMemo(() => {
        if (!startTime || !endTime) return null
        const startMinutes = toMinutes(startTime)
        const endMinutes = toMinutes(endTime)
        if (startMinutes === null || endMinutes === null) return null
        if (endMinutes <= startMinutes) return 'Время окончания должно быть позже начала.'
        return null
    }, [startTime, endTime])

    const isFormInvalid = !title || !date || !startTime || !endTime || !position || !!timeRangeError

    const resetForm = useCallback(() => {
        setTitle('')
        setDescription('')
        setDate(null)
        setStartTime('')
        setEndTime('')
        setPay('')
        setLocation('')
        setRequirements('')
        setShiftType(initialShiftType ?? 'vacancy')
        setUrgent(false)
        setPosition('')
        setSpecialization('')
        setSubmitError(null)
    }, [initialShiftType])

    const handleSave = useCallback(async (): Promise<boolean> => {
        if (!title || !date || !startTime || !endTime || !position || timeRangeError) return false
        setSubmitError(null)

        try {
            const response = await createShift({
                shift: {
                    title,
                    description: description || undefined,
                    start_time: buildDateTime(date!, startTime),
                    end_time: buildDateTime(date!, endTime),
                    payment: pay ? Number(pay) : undefined,
                    location: location || undefined,
                    requirements: requirements || undefined,
                    shift_type: shiftType,
                    urgent,
                    position,
                    specialization: specialization || undefined,
                },
            }).unwrap()

            onSave?.(response ?? null)
            resetForm()
            showToast?.('Смена успешно создана', 'success')
            return true
        } catch (error) {
            const message: string =
                typeof error === 'object' &&
                    error !== null &&
                    'data' in error &&
                    typeof (error as { data?: { message?: string } }).data?.message === 'string'
                    ? (error as { data?: { message?: string } }).data!.message!
                    : 'Не удалось создать смену. Попробуйте еще раз.'
            setSubmitError(message)
            showToast?.(message, 'error')
            return false
        }
    }, [
        title,
        description,
        date,
        startTime,
        endTime,
        pay,
        location,
        requirements,
        shiftType,
        urgent,
        position,
        specialization,
        createShift,
        onSave,
        resetForm,
        showToast,
        timeRangeError,
    ])

    return {
        title,
        setTitle,
        description,
        setDescription,
        date,
        setDate,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        pay,
        setPay,
        location,
        setLocation,
        requirements,
        setRequirements,
        shiftType,
        setShiftType,
        urgent,
        setUrgent,
        position,
        setPosition,
        specialization,
        setSpecialization,
        submitError,
        isCreating,
        isFormInvalid,
        timeRangeError,
        handleSave,
        resetForm,
    } as const
}


