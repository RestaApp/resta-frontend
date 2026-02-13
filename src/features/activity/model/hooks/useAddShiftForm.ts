import { useCallback, useMemo, useState } from 'react'
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

export const useAddShiftForm = ({
  initialShiftType = 'vacancy',
  onSave,
  initialValues = null,
}: UseAddShiftFormOptions = {}) => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation()
  const [updateShiftMutation] = useUpdateShiftMutation()

  // Получаем существующие смены для валидации
  const { data: myShiftsData } = useGetMyShiftsQuery(undefined, {
    skip: !!initialValues?.id, // Не загружаем при редактировании
  })
  const existingShifts = useMemo(() => normalizeVacanciesResponse(myShiftsData), [myShiftsData])

  const [title, setTitle] = useState(() => initialValues?.title || '')
  const [description, setDescription] = useState(() => initialValues?.description || '')
  const [date, setDate] = useState<string | null>(() => {
    const start = initialValues?.start_time
    if (!start) return null
    const dt = new Date(start)
    if (Number.isNaN(dt.getTime())) return null
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })
  const [startTime, setStartTime] = useState(() => {
    const start = initialValues?.start_time
    if (!start) return ''
    const dt = new Date(start)
    if (Number.isNaN(dt.getTime())) return ''
    return dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  })
  const [endTime, setEndTime] = useState(() => {
    const end = initialValues?.end_time
    if (!end) return ''
    const dt = new Date(end)
    if (Number.isNaN(dt.getTime())) return ''
    return dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  })
  const [pay, setPay] = useState(() => {
    if (!initialValues) return ''
    if (initialValues.payment) return String(initialValues.payment)
    if (initialValues.hourly_rate) return String(initialValues.hourly_rate)
    return ''
  })
  const [location, setLocation] = useState(() => initialValues?.location || '')
  const [requirements, setRequirements] = useState(() => initialValues?.requirements || '')
  const [shiftType, setShiftType] = useState<ShiftType>(() => {
    const v = initialValues?.shift_type
    if (v === 'vacancy' || v === 'replacement') return v
    return initialShiftType ?? 'vacancy'
  })
  const [urgent, setUrgent] = useState(() => !!initialValues?.urgent)
  const [position, setPosition] = useState(() => initialValues?.position || '')
  const [specializations, setSpecializations] = useState<string[]>(() => {
    const specValue = initialValues?.specialization || ''
    return specValue
      ? specValue
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : []
  })
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
        const selectedDateTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          0,
          0
        )

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
    const hasActiveShiftWithSamePosition = existingShifts.some(shift => {
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
  }, [position, existingShifts, initialValues, t])

  const isFormInvalid =
    !title ||
    !date ||
    !startTime ||
    !endTime ||
    !position ||
    !!timeRangeError ||
    !!dateError ||
    !!positionError

  const translateError = useCallback(
    (error: string): string => {
      const lowerError = error.toLowerCase()
      if (
        lowerError.includes("specialization can't be blank") ||
        lowerError.includes('specialization is required') ||
        lowerError.includes('специализация обязательна')
      ) {
        return t('validation.specializationRequired')
      }
      if (
        lowerError.includes('active shift') ||
        lowerError.includes('позицией') ||
        lowerError.includes('position')
      ) {
        return t('validation.duplicatePosition')
      }
      if (lowerError.includes("can't be blank") || lowerError.includes('is required')) {
        return t('validation.fillRequired')
      }
      return error
    },
    [t]
  )

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
    setSubmitError(null)
    if (
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !position ||
      specializations.length === 0 ||
      timeRangeError ||
      dateError ||
      positionError
    )
      {
        setSubmitError(
          specializations.length === 0 ? t('validation.specializationRequired') : t('validation.fillRequired')
        )
      return false
    }

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
        const updateResult = await updateShiftMutation({
          id: String(initialValues.id),
          body: payload.shift,
        }).unwrap()
        // сервер может вернуть { success: false, errors: [...] } even with 200
        if (updateResult && typeof updateResult === 'object') {
          const r = updateResult as unknown as Record<string, unknown>
          const hasErrors =
            r.success === false || (Array.isArray(r.errors) && r.errors.length > 0) || !!r.errors
          if (hasErrors) {
            const errs = r.errors ?? (typeof r.message === 'string' ? [r.message] : [])
            const errorMessages = Array.isArray(errs) ? errs.map(String) : [String(errs)]
            const translatedMessages = errorMessages.map(translateError)
            const msg = translatedMessages.join('; ')
            setSubmitError(msg)
            showToast?.(msg, 'error')
            return false
          }
        }
        showToast?.(t('shift.updated'), 'success')
        response = null
      } else {
        try {
          const createResult = await createShift(payload).unwrap()
          if (createResult && typeof createResult === 'object') {
            const r = createResult as Record<string, unknown>
            const hasErrors =
              r.success === false || (Array.isArray(r.errors) && r.errors.length > 0) || !!r.errors
            if (hasErrors) {
              const errs = r.errors ?? (typeof r.message === 'string' ? [r.message] : [])
              const errorMessages = Array.isArray(errs) ? errs.map(String) : [String(errs)]
              const translatedMessages = errorMessages.map(translateError)
              const msg = translatedMessages.join('; ')
              setSubmitError(msg)
              showToast?.(msg, 'error')
              return false
            }
          }
          response = createResult
          showToast?.(t('shift.created'), 'success')
        } catch (error: unknown) {
          // Обработка ошибок от сервера
          let errorMessage = t('shift.createError')

          if (error && typeof error === 'object' && 'data' in error) {
            const data = (error as { data?: unknown }).data
            // Проверяем разные форматы ошибок
            if (data && typeof data === 'object') {
              const dataObj = data as Record<string, unknown>
              const errors = dataObj.errors
              const message = dataObj.message
              const messageAlt = dataObj.error

              if (Array.isArray(errors)) {
                const translatedErrors = errors.map(e => translateError(String(e)))
                errorMessage = translatedErrors.join('; ')
              } else if (typeof message === 'string') {
                errorMessage = translateError(message)
              } else if (typeof messageAlt === 'string') {
                errorMessage = translateError(messageAlt)
              }
            }
          } else if (error instanceof Error) {
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
    } catch (error: unknown) {
      let errorMessage = t('shift.updateError')

      if (error && typeof error === 'object' && 'data' in error) {
        const data = (error as { data?: unknown }).data
        if (data && typeof data === 'object') {
          const dataObj = data as Record<string, unknown>
          const errors = dataObj.errors
          const message = dataObj.message
          const messageAlt = dataObj.error

          if (Array.isArray(errors)) {
            const translatedErrors = errors.map(e => translateError(String(e)))
            errorMessage = translatedErrors.join('; ')
          } else if (typeof message === 'string') {
            errorMessage = translateError(message)
          } else if (typeof messageAlt === 'string') {
            errorMessage = translateError(messageAlt)
          }
        }
      } else if (error instanceof Error) {
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
