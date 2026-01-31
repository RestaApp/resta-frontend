import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    useCreateShiftMutation,
    useUpdateShiftMutation,
    useGetMyShiftsQuery,
    type CreateShiftResponse,
    type VacancyApiItem,
} from '@/services/api/shiftsApi'
import { useToast } from '@/hooks/useToast'
import { toMinutes, buildDateTime } from '@/utils/date'
import { normalizeVacanciesResponse } from '@/features/profile/model/utils/normalizeShiftsResponse'

export type ShiftType = 'vacancy' | 'replacement'

type UseAddShiftFormOptions = {
    initialShiftType?: ShiftType | null
    onSave?: (shift: CreateShiftResponse | null) => void
    initialValues?: VacancyApiItem | null
}

export const useAddShiftForm = ({ initialShiftType = 'vacancy', onSave, initialValues = null }: UseAddShiftFormOptions = {}) => {
    const { t } = useTranslation()
    const { showToast } = useToast()
    const [createShift, { isLoading: isCreating }] = useCreateShiftMutation()
    const [updateShiftMutation] = useUpdateShiftMutation()
    
    // Получаем существующие смены для валидации
    const { data: myShiftsData } = useGetMyShiftsQuery(undefined, {
        skip: !!initialValues?.id, // Не загружаем при редактировании
    })
    const existingShifts = useMemo(() => normalizeVacanciesResponse(myShiftsData), [myShiftsData])

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
        if (endMinutes <= startMinutes) return t('validation.timeEndAfterStart')
        return null
    }, [startTime, endTime, t])

    const dateError = useMemo(() => {
        if (!date) return null
        
        const selectedDate = new Date(date + 'T00:00:00')
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        // Проверяем, что дата не в прошлом
        if (selectedDate < today) {
            return t('validation.dateInFuture')
        }
        
        // Если выбрана сегодняшняя дата, проверяем время
        if (selectedDate.getTime() === today.getTime() && startTime) {
            const [hours, minutes] = startTime.split(':').map(Number)
            if (!isNaN(hours) && !isNaN(minutes)) {
                const selectedDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
                
                if (selectedDateTime <= now) {
                    return t('validation.timeInFuture')
                }
            }
        }
        
        return null
    }, [date, startTime, t])

    // Валидация: проверка на существующую смену с такой же позицией
    const positionError = useMemo(() => {
        // При редактировании не проверяем
        if (initialValues?.id) return null
        if (!position) return null
        if (existingShifts.length === 0) return null
        
        // Проверяем, есть ли уже активная смена с такой же позицией
        const hasActiveShiftWithSamePosition = existingShifts.some((shift: any) => {
            // Пропускаем редактируемую смену (если есть)
            if (initialValues?.id && shift.id === initialValues.id) return false
            
            // Проверяем, что позиция совпадает
            if (shift.position !== position) return false
            
            // Проверяем, что смена еще не прошла (активная)
            if (!shift.start_time) return false
            
            try {
                const shiftStartDate = new Date(shift.start_time)
                const now = new Date()
                
                // Смена считается активной, если она в будущем или сегодня (еще не началась или идет)
                // Также проверяем end_time - если смена еще не закончилась, она активна
                if (shift.end_time) {
                    const shiftEndDate = new Date(shift.end_time)
                    // Смена активна, если она еще не закончилась
                    return shiftEndDate >= now
                }
                
                // Если нет end_time, проверяем только start_time
                return shiftStartDate >= now
            } catch {
                // Если не удалось распарсить дату, считаем смену активной
                return true
            }
        })
        
        if (hasActiveShiftWithSamePosition) {
            return t('validation.duplicatePosition')
        }
        
        return null
    }, [position, existingShifts, initialValues?.id, t])

    const isFormInvalid = !title || !date || !startTime || !endTime || !position || !!timeRangeError || !!dateError || !!positionError

    const translateError = useCallback((error: string): string => {
        const lowerError = error.toLowerCase()
        if (lowerError.includes("specialization can't be blank") ||
            lowerError.includes("specialization is required") ||
            lowerError.includes("специализация обязательна")) {
            return t('validation.specializationRequired')
        }
        if (lowerError.includes('active shift') ||
            lowerError.includes('позицией') ||
            lowerError.includes('position')) {
            return t('validation.duplicatePosition')
        }
        if (lowerError.includes("can't be blank") || lowerError.includes("is required")) {
            return t('validation.fillRequired')
        }
        return error
    }, [t])

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
        if (!title || !date || !startTime || !endTime || !position || timeRangeError || dateError || positionError) return false
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
                    const errorMessages = Array.isArray(errs) ? errs : [String(errs)]
                    const translatedMessages = errorMessages.map(translateError)
                    const msg = translatedMessages.join('; ')
                    setSubmitError(msg)
                    showToast?.(msg, 'error')
                    return false
                }
                showToast?.(t('shift.updated'), 'success')
                response = null
            } else {
                try {
                    const createResult = await createShift(payload).unwrap()
                    if (createResult?.success === false || (createResult as any)?.errors) {
                        const errs = (createResult as any).errors ?? (createResult.message ? [createResult.message] : [])
                        const errorMessages = Array.isArray(errs) ? errs : [String(errs)]
                        const translatedMessages = errorMessages.map(translateError)
                        const msg = translatedMessages.join('; ')
                        setSubmitError(msg)
                        showToast?.(msg, 'error')
                        return false
                    }
                    response = createResult
                    showToast?.(t('shift.created'), 'success')
                } catch (error: any) {
                    // Обработка ошибок от сервера
                    let errorMessage = t('shift.createError')
                    
                    if (error?.data) {
                        // Проверяем разные форматы ошибок
                        if (error.data.errors && Array.isArray(error.data.errors)) {
                            const translatedErrors = error.data.errors.map(translateError)
                            errorMessage = translatedErrors.join('; ')
                        } else if (error.data.message) {
                            errorMessage = translateError(error.data.message)
                        } else if (error.data.error) {
                            errorMessage = translateError(error.data.error)
                        }
                    } else if (error?.message) {
                        errorMessage = translateError(error.message)
                    }
                    
                    setSubmitError(errorMessage)
                    showToast?.(errorMessage, 'error')
                    return false
                }
            }

            onSave?.(response ?? null)
            resetForm()
            return true
        } catch (error: any) {
            let errorMessage = t('shift.updateError')
            
            if (error?.data) {
                if (error.data.errors && Array.isArray(error.data.errors)) {
                    const translatedErrors = error.data.errors.map(translateError)
                    errorMessage = translatedErrors.join('; ')
                } else if (error.data.message) {
                    errorMessage = translateError(error.data.message)
                } else if (error.data.error) {
                    errorMessage = translateError(error.data.error)
                }
            } else if (error?.message) {
                errorMessage = translateError(error.message)
            }
            
            setSubmitError(errorMessage)
            showToast?.(errorMessage, 'error')
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
        dateError,
        positionError,
        initialValues,
        updateShiftMutation,
        translateError,
        t,
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
        dateError,
        positionError,
        handleSave,
        resetForm,
    } as const
}


