import { useCallback, useEffect, useState } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { findFirstInvalidStep, type AddShiftDrawerFormState, type StepIndex } from './validation'

interface UseAddShiftDrawerSubmitOptions {
  open: boolean
  drawerFormState: AddShiftDrawerFormState
  initialValues: VacancyApiItem | null
  /** Вызвать save (returns true on success). */
  onSave: () => Promise<boolean>
  /** Закрыть drawer (handled snapshot reset наружу). */
  close: () => void
  /** Сброс step state после неудачного submit / открытие success state. */
  setStep: (step: StepIndex) => void
  setAttemptedSteps: (next: [boolean, boolean, boolean]) => void
  setDidAttemptSubmit: (next: boolean) => void
  /** Smooth scroll к первой невалидной строке внутри указанного шага. */
  scrollToFirstInvalidInStep: (step: StepIndex) => void
}

/**
 * Submit flow + auto‑close success.
 * SRP: оркестрирует только submit‑событие и его последствия (success / errors / scroll).
 */
export const useAddShiftDrawerSubmit = ({
  open,
  drawerFormState,
  initialValues,
  onSave,
  close,
  setStep,
  setAttemptedSteps,
  setDidAttemptSubmit,
  scrollToFirstInvalidInStep,
}: UseAddShiftDrawerSubmitOptions) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  // Auto‑close success экрана через 3 секунды (только пока drawer открыт).
  useEffect(() => {
    if (!open) return
    if (!isSuccessOpen) return
    const id = window.setTimeout(() => close(), 3000)
    return () => window.clearTimeout(id)
  }, [open, isSuccessOpen, close])

  const handleSubmit = useCallback(async () => {
    setDidAttemptSubmit(true)
    const ok = await onSave()
    if (ok) {
      if (initialValues?.id) close()
      else setIsSuccessOpen(true)
      return
    }
    const invalidStep = findFirstInvalidStep(drawerFormState)
    setStep(invalidStep)
    setAttemptedSteps([true, true, true])
    // setTimeout 0 — даём рендеру обновить ошибки полей до scroll.
    setTimeout(() => scrollToFirstInvalidInStep(invalidStep), 0)
  }, [
    close,
    drawerFormState,
    initialValues?.id,
    onSave,
    scrollToFirstInvalidInStep,
    setAttemptedSteps,
    setDidAttemptSubmit,
    setStep,
  ])

  return { isSuccessOpen, setIsSuccessOpen, handleSubmit }
}
