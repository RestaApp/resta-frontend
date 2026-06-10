import { useCallback, useState } from 'react'
import { findFirstInvalidStep, type AddShiftDrawerFormState, type StepIndex } from './validation'

interface UseAddShiftDrawerSubmitOptions {
  drawerFormState: AddShiftDrawerFormState
  /** Вызвать save (returns true on success). */
  onSave: () => Promise<boolean>
  /** Сброс step state после неудачного submit / открытие success state. */
  setStep: (step: StepIndex) => void
  setAttemptedSteps: (next: [boolean, boolean, boolean]) => void
  setDidAttemptSubmit: (next: boolean) => void
  /** Smooth scroll к первой невалидной строке внутри указанного шага. */
  scrollToFirstInvalidInStep: (step: StepIndex) => void
}

/**
 * Submit flow.
 * SRP: оркестрирует submit‑событие и его последствия (success state / errors / scroll).
 */
export const useAddShiftDrawerSubmit = ({
  drawerFormState,
  onSave,
  setStep,
  setAttemptedSteps,
  setDidAttemptSubmit,
  scrollToFirstInvalidInStep,
}: UseAddShiftDrawerSubmitOptions) => {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  const handleSubmit = useCallback(async () => {
    setDidAttemptSubmit(true)
    const ok = await onSave()
    if (ok) {
      setIsSuccessOpen(true)
      return
    }
    const invalidStep = findFirstInvalidStep(drawerFormState)
    setStep(invalidStep)
    setAttemptedSteps([true, true, true])
    // setTimeout 0 — даём рендеру обновить ошибки полей до scroll.
    setTimeout(() => scrollToFirstInvalidInStep(invalidStep), 0)
  }, [
    drawerFormState,
    onSave,
    scrollToFirstInvalidInStep,
    setAttemptedSteps,
    setDidAttemptSubmit,
    setStep,
  ])

  return { isSuccessOpen, setIsSuccessOpen, handleSubmit }
}
