import { useCallback, useState } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import {
  getInitialPay,
  getInitialShiftDate,
  getInitialShiftTime,
  getInitialSpecializations,
} from '../utils/addShiftFormInitialization'
import type { AddShiftFieldErrors } from '../utils/addShiftValidation'

export type ShiftType = 'vacancy' | 'replacement'

interface UseAddShiftFormStateOptions {
  initialShiftType: ShiftType | null
  initialValues: VacancyApiItem | null
  initialLocation: string | null
}

/**
 * Чистое form‑state hook без бизнес‑логики и эффектов.
 *
 * Все поля контролируемые. `resetForm` сбрасывает к initial values
 * (используется после успешного submit и при ручном reset из drawer flow).
 */
export const useAddShiftFormState = ({
  initialShiftType,
  initialValues,
  initialLocation,
}: UseAddShiftFormStateOptions) => {
  const [title, setTitle] = useState(() => initialValues?.title || '')
  const [description, setDescription] = useState(() => initialValues?.description || '')
  const [date, setDate] = useState<string | null>(() => getInitialShiftDate(initialValues))
  const [startTime, setStartTime] = useState(() => getInitialShiftTime(initialValues, 'start_time'))
  const [endTime, setEndTime] = useState(() => getInitialShiftTime(initialValues, 'end_time'))
  const [pay, setPay] = useState(() => getInitialPay(initialValues))
  const [location, setLocation] = useState(() => initialValues?.location || initialLocation || '')
  const [requirements, setRequirements] = useState(() => initialValues?.requirements || '')
  const [shiftType, setShiftType] = useState<ShiftType>(() => {
    const v = initialValues?.shift_type
    if (v === 'vacancy' || v === 'replacement') return v
    return initialShiftType ?? 'vacancy'
  })
  const [urgent, setUrgent] = useState(() => !!initialValues?.urgent)
  const [position, setPosition] = useState(() => initialValues?.position || '')
  const [specializations, setSpecializations] = useState<string[]>(() =>
    getInitialSpecializations(initialValues)
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<AddShiftFieldErrors>({})

  const clearSubmitError = useCallback(() => {
    setSubmitError(null)
    setFieldErrors({})
  }, [])

  const resetForm = useCallback(() => {
    setTitle('')
    setDescription('')
    setDate(null)
    setStartTime('')
    setEndTime('')
    setPay('')
    setLocation(initialLocation || '')
    setRequirements('')
    setShiftType(initialShiftType ?? 'vacancy')
    setUrgent(false)
    setPosition('')
    setSpecializations([])
    setSubmitError(null)
    setFieldErrors({})
  }, [initialShiftType, initialLocation])

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
    setSubmitError,
    fieldErrors,
    setFieldErrors,
    clearSubmitError,
    resetForm,
  }
}

export type AddShiftFormState = ReturnType<typeof useAddShiftFormState>
