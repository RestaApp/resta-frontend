import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    useCreateShiftMutation,
    useUpdateShiftMutation,
    type CreateShiftResponse,
    type VacancyApiItem,
} from '@/services/api/shiftsApi'
import { useToast } from '@/hooks/useToast'
import { toMinutes, buildDateTime } from '@/utils/date'

export type ShiftType = 'vacancy' | 'replacement'

type UseAddShiftFormOptions = {
    initialShiftType?: ShiftType | null
    onSave?: (shift: CreateShiftResponse | null) => void
    initialValues?: VacancyApiItem | null
}

export const useAddShiftForm = ({ initialShiftType = 'vacancy', onSave, initialValues = null }: UseAddShiftFormOptions = {}) => {
    const { showToast } = useToast()
    const [createShift, { isLoading: isCreating }] = useCreateShiftMutation()
    const [updateShiftMutation] = useUpdateShiftMutation()

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
    const [specializations, setSpecializations] = useState<string[]>([])
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
        setSpecializations([])
        setSubmitError(null)
    }, [initialShiftType])

    const handleSave = useCallback(async (): Promise<boolean> => {
        if (!title || !date || !startTime || !endTime || !position || timeRangeError) return false
        setSubmitError(null)

        try {
            let response: CreateShiftResponse | null = null
            const payload = {
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
                    specialization: specializations.length > 0 ? specializations.join(',') : undefined,
                },
            }

            if (initialValues?.id) {
                // update existing shift
                const updateResult = await updateShiftMutation({ id: String(initialValues.id), data: payload }).unwrap()
                // сервер может вернуть { success: false, errors: [...] } even with 200
                if ((updateResult as any)?.success === false || (updateResult as any)?.errors) {
                    const errs = (updateResult as any).errors ?? ((updateResult as any).message ? [(updateResult as any).message] : [])
                    const msg = Array.isArray(errs) ? errs.join('; ') : String(errs)
                    setSubmitError(msg)
                    showToast?.(msg, 'error')
                    return false
                }
                showToast?.('Смена успешно обновлена', 'success')
                response = null
            } else {
                const createResult = await createShift(payload).unwrap()
                if (createResult?.success === false || (createResult as any)?.errors) {
                    const errs = (createResult as any).errors ?? (createResult.message ? [createResult.message] : [])
                    const msg = Array.isArray(errs) ? errs.join('; ') : String(errs)
                    setSubmitError(msg)
                    showToast?.(msg, 'error')
                    return false
                }
                response = createResult
                showToast?.('Смена успешно создана', 'success')
            }

            onSave?.(response ?? null)
            resetForm()
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
        specializations,
        createShift,
        onSave,
        resetForm,
        showToast,
        timeRangeError,
        initialValues,
        updateShiftMutation,
    ])

    useEffect(() => {
        if (initialValues) {
            setTitle(initialValues.title || '')
            setDescription(initialValues.description || '')
            // try to extract date part from ISO-like start_time
            if (initialValues.start_time) {
                const dt = new Date(initialValues.start_time)
                // format as yyyy-mm-dd for DatePicker value
                const yyyy = dt.getFullYear()
                const mm = String(dt.getMonth() + 1).padStart(2, '0')
                const dd = String(dt.getDate()).padStart(2, '0')
                setDate(`${yyyy}-${mm}-${dd}`)
                setStartTime(dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
            }
            if (initialValues.end_time) {
                const dt2 = new Date(initialValues.end_time)
                setEndTime(dt2.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
            }
            setPay(initialValues.payment ? String(initialValues.payment) : (initialValues.hourly_rate ? String(initialValues.hourly_rate) : ''))
            setLocation(initialValues.location || '')
            setRequirements(initialValues.requirements || '')
            // prefer explicit nullish coalescing to avoid operator precedence issues
            setShiftType((initialValues.shift_type as ShiftType) ?? initialShiftType ?? 'vacancy')
            setUrgent(!!initialValues.urgent)
            setPosition(initialValues.position || '')
            // Если specialization - строка с разделителями, разбиваем на массив
            const specValue = initialValues.specialization || ''
            setSpecializations(specValue ? specValue.split(',').map(s => s.trim()).filter(Boolean) : [])
        }
    }, [initialValues, initialShiftType])

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
        specializations,
        setSpecializations,
        submitError,
        isCreating,
        isFormInvalid,
        timeRangeError,
        handleSave,
        resetForm,
    } as const
}


