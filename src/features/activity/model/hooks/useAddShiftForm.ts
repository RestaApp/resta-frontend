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
import { addDaysToISODate } from '@/utils/datetime'
import { normalizeVacanciesResponse } from '@/features/profile/model/utils/normalizeShiftsResponse'
import { parseApiDateTime } from '@/features/feed/model/utils/formatting'

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
  const toInputDate = (date: Date): string => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const toInputTime = (date: Date): string => {
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }

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
    const dt = parseApiDateTime(start)
    if (!dt) return null
    return toInputDate(dt)
  })
  const [startTime, setStartTime] = useState(() => {
    const start = initialValues?.start_time
    if (!start) return ''
    const dt = parseApiDateTime(start)
    if (!dt) return ''
    return toInputTime(dt)
  })
  const [endTime, setEndTime] = useState(() => {
    const end = initialValues?.end_time
    if (!end) return ''
    const dt = parseApiDateTime(end)
    if (!dt) return ''
    return toInputTime(dt)
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
    const list = initialValues?.specializations
    if (list?.length) return list
    const specValue = initialValues?.specialization || ''
    return specValue
      ? specValue
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : []
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  type FieldErrors = Partial<Record<'location' | 'requirements' | 'description' | 'specializations', string>>
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const clearSubmitError = useCallback(() => {
    setSubmitError(null)
    setFieldErrors({})
  }, [])

  const timeRangeError = useMemo(() => {
    if (!startTime || !endTime) return null
    const startMinutes = toMinutes(startTime)
    const endMinutes = toMinutes(endTime)
    if (startMinutes === null || endMinutes === null) return t('validation.invalidTime')
    // Ночная смена: конец < начала — допустимо (конец на след. день)
    if (endMinutes < startMinutes) return null
    if (endMinutes === startMinutes) return t('validation.timeEndAfterStart')
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
    !location ||
    !description ||
    !requirements ||
    !position ||
    specializations.length === 0 ||
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
      if (lowerError.includes("description can't be blank") || lowerError.includes('описание')) {
        return t('validation.requiredField')
      }
      if (
        lowerError.includes("requirements can't be blank") ||
        lowerError.includes('требования') ||
        lowerError.includes('requirements')
      ) {
        return t('validation.requiredField')
      }
      if (lowerError.includes("location can't be blank") || lowerError.includes('локац')) {
        return t('validation.requiredField')
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
    setFieldErrors({})
  }, [initialShiftType])

  const applyServerErrors = useCallback(
    (errors: string[]) => {
      const nextFieldErrors: FieldErrors = {}
      const generalMessages: string[] = []

      for (const raw of errors) {
        const msg = String(raw || '').trim()
        if (!msg) continue
        const lower = msg.toLowerCase()

        if (lower.includes('specialization')) {
          nextFieldErrors.specializations = t('validation.specializationRequired')
          continue
        }
        if (lower.includes('description')) {
          nextFieldErrors.description = t('validation.requiredField')
          continue
        }
        if (lower.includes('requirements')) {
          nextFieldErrors.requirements = t('validation.requiredField')
          continue
        }
        if (lower.includes('location')) {
          nextFieldErrors.location = t('validation.requiredField')
          continue
        }

        generalMessages.push(translateError(msg))
      }

      setFieldErrors(nextFieldErrors)
      const uniqueGeneral = Array.from(new Set(generalMessages)).filter(Boolean)
      const joined = uniqueGeneral.join('; ')
      setSubmitError(joined || null)
      return { hasFieldErrors: Object.keys(nextFieldErrors).length > 0, message: joined }
    },
    [t, translateError]
  )

  const handleSave = useCallback(async (): Promise<boolean> => {
    setSubmitError(null)
    setFieldErrors({})
    if (
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !location ||
      !description ||
      !requirements ||
      !position ||
      specializations.length === 0 ||
      timeRangeError ||
      dateError ||
      positionError
    ) {
      return false
    }

    try {
      let response: CreateShiftResponse | null = null
      const startM = toMinutes(startTime)
      const endM = toMinutes(endTime)
      const isNightShift =
        startM !== null && endM !== null && endM <= startM
      const endDate = isNightShift ? addDaysToISODate(date!, 1) : date!

      const payload = {
        shift: {
          title,
          description,
          start_time: buildDateTime(date!, startTime),
          end_time: buildDateTime(endDate, endTime),
          payment: pay ? Number(pay) : undefined,
          location,
          requirements,
          shift_type: shiftType,
          urgent,
          position,
          specializations: specializations.length > 0 ? specializations : undefined,
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
            const { hasFieldErrors, message } = applyServerErrors(errorMessages)
            if (message) showToast?.(message, 'error')
            if (hasFieldErrors) return false
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
              const { hasFieldErrors, message } = applyServerErrors(errorMessages)
              if (message) showToast?.(message, 'error')
              if (hasFieldErrors) return false
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
                const errorMessages = errors.map(e => String(e))
                const { message } = applyServerErrors(errorMessages)
                if (message) showToast?.(message, 'error')
                return false
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
            const errorMessages = errors.map(e => String(e))
            const { message } = applyServerErrors(errorMessages)
            if (message) showToast?.(message, 'error')
            return false
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
    applyServerErrors,
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
    clearSubmitError,
    isCreating,
    isFormInvalid,
    timeRangeError,
    dateError,
    positionError,
    fieldErrors,
    handleSave,
    resetForm,
  } as const
}
