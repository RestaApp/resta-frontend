import { useCallback, useMemo } from 'react'
import type { ShiftType } from '@/features/activity/model/hooks/useAddShiftForm'

interface FormSetters {
  setTitle: (value: string) => void
  setDate: (value: string | null) => void
  setStartTime: (value: string) => void
  setEndTime: (value: string) => void
  setPay: (value: string) => void
  setLocation: (value: string[]) => void
  setCity: (value: string) => void
  setRequirements: (value: string) => void
  setShiftType: (value: ShiftType) => void
  setUrgent: (value: boolean) => void
  setPosition: (value: string) => void
  setSpecializations: (value: string[]) => void
  setDescription: (value: string) => void
  position: string
  specializations: string[]
}

interface UseAddShiftDrawerHandlersOptions {
  form: FormSetters
  clearAllErrorsAfterChange: () => void
}

/**
 * Все input‑handlers add‑shift drawer'а: каждый из них перед записью значения
 * сбрасывает накопленные ошибки шагов через `clearAllErrorsAfterChange`.
 *
 * SRP: чисто input‑routing, логика валидации/submit/step‑navigation — снаружи.
 */
export const useAddShiftDrawerHandlers = ({
  form,
  clearAllErrorsAfterChange,
}: UseAddShiftDrawerHandlersOptions) => {
  const wrapStringSetter = useCallback(
    (setValue: (value: string) => void) => (next: string) => {
      clearAllErrorsAfterChange()
      setValue(next)
    },
    [clearAllErrorsAfterChange]
  )

  const wrapBooleanSetter = useCallback(
    (setValue: (value: boolean) => void) => (next: boolean) => {
      clearAllErrorsAfterChange()
      setValue(next)
    },
    [clearAllErrorsAfterChange]
  )

  const wrapArraySetter = useCallback(
    (setValue: (value: string[]) => void) => (next: string[]) => {
      clearAllErrorsAfterChange()
      setValue(next)
    },
    [clearAllErrorsAfterChange]
  )

  const handleTitleChange = useMemo(
    () => wrapStringSetter(form.setTitle),
    [form.setTitle, wrapStringSetter]
  )
  const handleStartTimeChange = useMemo(
    () => wrapStringSetter(form.setStartTime),
    [form.setStartTime, wrapStringSetter]
  )
  const handleEndTimeChange = useMemo(
    () => wrapStringSetter(form.setEndTime),
    [form.setEndTime, wrapStringSetter]
  )
  const handlePayChange = useMemo(
    () => wrapStringSetter(form.setPay),
    [form.setPay, wrapStringSetter]
  )
  const handleLocationChange = useMemo(
    () => wrapArraySetter(form.setLocation),
    [form.setLocation, wrapArraySetter]
  )
  const handleCityChange = useMemo(
    () => wrapStringSetter(form.setCity),
    [form.setCity, wrapStringSetter]
  )
  const handleDescriptionChange = useMemo(
    () => wrapStringSetter(form.setDescription),
    [form.setDescription, wrapStringSetter]
  )
  const handleRequirementsChange = useMemo(
    () => wrapStringSetter(form.setRequirements),
    [form.setRequirements, wrapStringSetter]
  )
  const handleUrgentChange = useMemo(
    () => wrapBooleanSetter(form.setUrgent),
    [form.setUrgent, wrapBooleanSetter]
  )
  const handleSpecializationsChange = useMemo(
    () => wrapArraySetter(form.setSpecializations),
    [form.setSpecializations, wrapArraySetter]
  )

  const handleDateChange = useCallback(
    (next: string | null) => {
      clearAllErrorsAfterChange()
      form.setDate(next)
    },
    [clearAllErrorsAfterChange, form]
  )

  const handleShiftTypeChange = useCallback(
    (next: string) => {
      clearAllErrorsAfterChange()
      form.setShiftType(next as ShiftType)
    },
    [clearAllErrorsAfterChange, form]
  )

  const handlePositionChange = useCallback(
    (next: string) => {
      clearAllErrorsAfterChange()
      // Смена позиции инвалидирует выбор специализаций.
      if (next !== form.position && form.specializations.length > 0) form.setSpecializations([])
      if (!next && form.specializations.length > 0) form.setSpecializations([])
      form.setPosition(next)
    },
    [clearAllErrorsAfterChange, form]
  )

  return {
    handleTitleChange,
    handleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handlePayChange,
    handleLocationChange,
    handleCityChange,
    handleShiftTypeChange,
    handlePositionChange,
    handleSpecializationsChange,
    handleDescriptionChange,
    handleRequirementsChange,
    handleUrgentChange,
  }
}
