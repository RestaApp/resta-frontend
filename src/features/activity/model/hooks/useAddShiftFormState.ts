import { useCallback, useState } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { normalizeCatalogPosition } from '@/shared/utils/roles'
import { toLocationArray } from '@/shared/utils/location'
import {
  getInitialPay,
  getInitialShiftDate,
  getInitialShiftTime,
  getInitialSpecializations,
} from '../utils/addShiftFormInitialization'
import type { AddShiftFieldErrors } from '../utils/addShiftValidation'

export type { ShiftType } from '@/shared/shifts/types'
import type { ShiftType } from '@/shared/shifts/types'

interface UseAddShiftFormStateOptions {
  initialShiftType: ShiftType | null
  initialValues: VacancyApiItem | null
  initialLocation: string[] | null
  initialCity: string | null
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
  initialCity,
}: UseAddShiftFormStateOptions) => {
  const [title, setTitle] = useState(() => initialValues?.title || '')
  const [description, setDescription] = useState(() => initialValues?.description || '')
  const [date, setDate] = useState<string | null>(() => getInitialShiftDate(initialValues))
  const [startTime, setStartTime] = useState(() => getInitialShiftTime(initialValues, 'start_time'))
  const [endTime, setEndTime] = useState(() => getInitialShiftTime(initialValues, 'end_time'))
  const [pay, setPay] = useState(() => getInitialPay(initialValues))
  const [location, setLocation] = useState<string[]>(() => {
    const fromValues = toLocationArray(initialValues?.location)
    if (fromValues.length > 0) return fromValues
    return initialLocation ?? []
  })
  /**
   * Город смены — отдельное поле, **не входит в `location`**.
   * Для employee выбирается на форме; для restaurant/supplier берётся из user.city.
   * Сохраняется в `user.city`, если у пользователя его ещё нет.
   */
  const [city, setCity] = useState<string>(() => initialCity ?? '')
  const [requirements, setRequirements] = useState(() => initialValues?.requirements || '')
  const [shiftType, setShiftType] = useState<ShiftType>(() => {
    const v = initialValues?.shift_type
    if (v === 'vacancy' || v === 'replacement') return v
    return initialShiftType ?? 'vacancy'
  })
  const [urgent, setUrgent] = useState(() => !!initialValues?.urgent)
  const [position, setPosition] = useState(() =>
    normalizeCatalogPosition(initialValues?.position || '')
  )
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
    setLocation(initialLocation ?? [])
    setCity(initialCity ?? '')
    setRequirements('')
    setShiftType(initialShiftType ?? 'vacancy')
    setUrgent(false)
    setPosition('')
    setSpecializations([])
    setSubmitError(null)
    setFieldErrors({})
  }, [initialShiftType, initialLocation, initialCity])

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
    city,
    setCity,
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
