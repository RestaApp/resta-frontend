import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetMyShiftsQuery,
  type CreateShiftResponse,
  type VacancyApiItem,
} from '@/services/api/shiftsApi'
import { normalizeVacanciesResponse } from '@/features/profile/model/utils/normalizeShiftsResponse'
import { useAuth } from '@/contexts/auth'
import { findDuplicatePosition, validateDate, validateTimeRange } from '../utils/addShiftValidation'
import { useAddShiftFormState, type ShiftType } from './useAddShiftFormState'
import { useAddShiftFormSubmission } from './useAddShiftFormSubmission'

type UseAddShiftFormOptions = {
  initialShiftType?: ShiftType | null
  onSave?: (shift: CreateShiftResponse | null) => void
  initialValues?: VacancyApiItem | null
  initialLocation?: string[] | null
  initialCity?: string | null
  /** Известный city пользователя — используется в submission, чтобы понять, нужно ли обновлять user.city. */
  userCity?: string | null
}

export type { ShiftType }

/**
 * Контроллер формы добавления/редактирования смены.
 *
 * Композиция:
 *  • `useAddShiftFormState`     — controlled state + reset;
 *  • derived валидации          — `validateTimeRange`, `validateDate`,
 *                                 `findDuplicatePosition` (pure functions);
 *  • `useAddShiftFormSubmission` — RTK Query мутации, server‑error mapping;
 *
 * Public API возвращаемого объекта **не изменён** — потребители (`AddShiftDrawer`,
 * `useAddShiftDrawerController`) работают как раньше.
 */
export const useAddShiftForm = ({
  initialShiftType = 'vacancy',
  onSave,
  initialValues = null,
  initialLocation = null,
  initialCity = null,
  userCity = null,
}: UseAddShiftFormOptions = {}) => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  // Источники данных для duplicate‑position валидации.
  const { data: myShiftsData } = useGetMyShiftsQuery(undefined, {
    skip: !!initialValues?.id || !isAuthenticated,
  })
  const existingShifts = useMemo(() => normalizeVacanciesResponse(myShiftsData), [myShiftsData])

  // Form state (controlled).
  const state = useAddShiftFormState({
    initialShiftType,
    initialValues,
    initialLocation,
    initialCity,
  })

  // Derived валидации — считаем при каждом рендере, без useMemo.
  // Стоимость каждой функции — единицы микросекунд.
  const timeRangeError = validateTimeRange(state.startTime, state.endTime, t)
  const dateError = validateDate(state.date, state.startTime, t)
  const positionError = !initialValues?.id
    ? findDuplicatePosition(existingShifts, state.position, undefined)
      ? t('validation.duplicatePosition')
      : null
    : null

  const isFormInvalid =
    !state.title ||
    !state.city.trim() ||
    state.location.every(line => !line.trim()) ||
    !state.description ||
    !state.requirements ||
    !state.position ||
    state.specializations.length === 0 ||
    (state.shiftType === 'replacement' && (!state.date || !state.startTime || !state.endTime)) ||
    (state.shiftType === 'replacement' && !!timeRangeError) ||
    (state.shiftType === 'replacement' && !!dateError) ||
    !!positionError

  const canSubmit = useCallback(() => !isFormInvalid, [isFormInvalid])

  const { handleSave, isCreating } = useAddShiftFormSubmission({
    state,
    initialValues,
    onSave,
    canSubmit,
    userCity,
  })

  return {
    title: state.title,
    setTitle: state.setTitle,
    description: state.description,
    setDescription: state.setDescription,
    date: state.date,
    setDate: state.setDate,
    startTime: state.startTime,
    setStartTime: state.setStartTime,
    endTime: state.endTime,
    setEndTime: state.setEndTime,
    pay: state.pay,
    setPay: state.setPay,
    location: state.location,
    setLocation: state.setLocation,
    city: state.city,
    setCity: state.setCity,
    requirements: state.requirements,
    setRequirements: state.setRequirements,
    shiftType: state.shiftType,
    setShiftType: state.setShiftType,
    urgent: state.urgent,
    setUrgent: state.setUrgent,
    position: state.position,
    setPosition: state.setPosition,
    specializations: state.specializations,
    setSpecializations: state.setSpecializations,
    submitError: state.submitError,
    clearSubmitError: state.clearSubmitError,
    isCreating,
    isFormInvalid,
    timeRangeError,
    dateError,
    positionError,
    fieldErrors: state.fieldErrors,
    handleSave,
    resetForm: state.resetForm,
  } as const
}
