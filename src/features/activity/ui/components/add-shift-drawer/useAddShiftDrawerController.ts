import { useCallback, useMemo, useRef, useState } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { ShiftType } from '@/features/activity/model/hooks/useAddShiftForm'
import {
  buildDrawerErrorState,
  findFirstInvalidStep,
  isStepValid,
  type AddShiftDrawerFormState,
  type StepIndex,
} from './validation'
import { useAddShiftDrawerHandlers } from './useAddShiftDrawerHandlers'
import { useAddShiftDrawerSubmit } from './useAddShiftDrawerSubmit'
import { triggerHapticFeedback } from '@/utils/haptics'

type UseAddShiftDrawerControllerParams = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues: VacancyApiItem | null
  t: (key: string, options?: Record<string, unknown>) => string
  form: {
    title: string
    setTitle: (value: string) => void
    description: string
    setDescription: (value: string) => void
    date: string | null
    setDate: (value: string | null) => void
    startTime: string
    setStartTime: (value: string) => void
    endTime: string
    setEndTime: (value: string) => void
    pay: string
    setPay: (value: string) => void
    location: string
    setLocation: (value: string) => void
    requirements: string
    setRequirements: (value: string) => void
    shiftType: ShiftType
    setShiftType: (value: ShiftType) => void
    urgent: boolean
    setUrgent: (value: boolean) => void
    position: string
    setPosition: (value: string) => void
    specializations: string[]
    setSpecializations: (value: string[]) => void
    submitError: string | null
    clearSubmitError: () => void
    isCreating: boolean
    timeRangeError: string | null
    dateError: string | null
    positionError: string | null
    fieldErrors: Partial<
      Record<'location' | 'requirements' | 'description' | 'specializations', string>
    >
    handleSave: () => Promise<boolean>
    resetForm: () => void
  }
}

/**
 * Контроллер add‑shift drawer'а: оркестрирует step state, валидацию,
 * input handlers и submit flow. Public API сохранён 1:1 с предыдущей версией.
 *
 * Композиция:
 *  • `useAddShiftDrawerHandlers` — wrapped setters (clear errors before write);
 *  • `useAddShiftDrawerSubmit`   — submit + auto‑close success + scroll on fail;
 *  • shape возврата (`refs/state/derived/actions`) — без изменений.
 */
export const useAddShiftDrawerController = ({
  open,
  onOpenChange,
  initialValues,
  t,
  form,
}: UseAddShiftDrawerControllerParams) => {
  const titleRef = useRef<HTMLDivElement | null>(null)
  const dateRef = useRef<HTMLDivElement | null>(null)
  const timeRef = useRef<HTMLDivElement | null>(null)
  const locationRef = useRef<HTMLDivElement | null>(null)
  const positionRef = useRef<HTMLDivElement | null>(null)
  const specializationRef = useRef<HTMLDivElement | null>(null)
  const descriptionRef = useRef<HTMLDivElement | null>(null)
  const requirementsRef = useRef<HTMLDivElement | null>(null)

  const [step, setStep] = useState<StepIndex>(0)
  const [attemptedSteps, setAttemptedSteps] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ])
  const [didAttemptSubmit, setDidAttemptSubmit] = useState(false)

  const requiredFieldError = t('validation.requiredField')
  const drawerFormState = form as AddShiftDrawerFormState
  const derivedState = useMemo(
    () =>
      buildDrawerErrorState({
        form: drawerFormState,
        attemptedSteps,
        didAttemptSubmit,
        requiredFieldError,
        t,
      }),
    [attemptedSteps, didAttemptSubmit, drawerFormState, requiredFieldError, t]
  )

  const clearAllErrorsAfterChange = useCallback(() => {
    form.clearSubmitError()
    if (didAttemptSubmit) setDidAttemptSubmit(false)
    if (attemptedSteps[0] || attemptedSteps[1] || attemptedSteps[2]) {
      setAttemptedSteps([false, false, false])
    }
  }, [attemptedSteps, didAttemptSubmit, form])

  const handlers = useAddShiftDrawerHandlers({ form, clearAllErrorsAfterChange })

  const scrollToFirstInvalidInStep = useCallback(
    (targetStep: StepIndex) => {
      const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      if (targetStep === 0) {
        if (!form.title.trim()) return scrollTo(titleRef)
        if (form.shiftType === 'replacement') {
          if (!form.date || form.dateError) return scrollTo(dateRef)
          if (!form.startTime || !form.endTime || form.timeRangeError) return scrollTo(timeRef)
        }
      }
      if (targetStep === 1) {
        if (!form.location.trim()) return scrollTo(locationRef)
        if (!form.position || form.positionError) return scrollTo(positionRef)
        if (form.position && form.specializations.length === 0) return scrollTo(specializationRef)
      }
      if (targetStep === 2) {
        if (!form.description.trim()) return scrollTo(descriptionRef)
        if (!form.requirements.trim()) return scrollTo(requirementsRef)
      }
    },
    [form]
  )

  const findInvalidStep = useCallback(
    () => findFirstInvalidStep(drawerFormState),
    [drawerFormState]
  )
  const isCurrentStepValid = useCallback(
    (targetStep: StepIndex) => isStepValid(drawerFormState, targetStep),
    [drawerFormState]
  )

  const handleDrawerOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setStep(0)
        setAttemptedSteps([false, false, false])
        setDidAttemptSubmit(false)
        setIsSuccessOpen(false)
        form.resetForm()
      }
      onOpenChange(next)
    },
    // setIsSuccessOpen ниже — стабильная ссылка из useState внутри useAddShiftDrawerSubmit;
    // включён в deps для ESLint exhaustive-deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, onOpenChange]
  )

  const close = useCallback(() => handleDrawerOpenChange(false), [handleDrawerOpenChange])

  const { isSuccessOpen, setIsSuccessOpen, handleSubmit } = useAddShiftDrawerSubmit({
    open,
    drawerFormState,
    initialValues,
    onSave: form.handleSave,
    close,
    setStep,
    setAttemptedSteps,
    setDidAttemptSubmit,
    scrollToFirstInvalidInStep,
  })

  const handleContinue = useCallback(() => {
    setAttemptedSteps(prev => {
      const next: [boolean, boolean, boolean] = [...prev] as [boolean, boolean, boolean]
      next[step] = true
      return next
    })

    if (isCurrentStepValid(step)) {
      setStep(prev => (prev < 2 ? ((prev + 1) as StepIndex) : prev))
      return
    }

    triggerHapticFeedback('warning')
    scrollToFirstInvalidInStep(step)
  }, [isCurrentStepValid, scrollToFirstInvalidInStep, step])

  const handleBackOrCancel = useCallback(() => {
    if (step === 0) {
      close()
      return
    }
    clearAllErrorsAfterChange()
    setStep(prev => (prev > 0 ? ((prev - 1) as StepIndex) : prev))
  }, [clearAllErrorsAfterChange, close, step])

  const handleCreateAnother = useCallback(() => {
    setIsSuccessOpen(false)
    setStep(0)
    setAttemptedSteps([false, false, false])
    setDidAttemptSubmit(false)
  }, [setIsSuccessOpen])

  return {
    refs: {
      titleRef,
      dateRef,
      timeRef,
      locationRef,
      positionRef,
      specializationRef,
      descriptionRef,
      requirementsRef,
    },
    state: {
      step,
      isSuccessOpen,
      attemptedSteps,
      didAttemptSubmit,
    },
    derived: {
      showErrors: derivedState.showErrors,
      showStep0Errors: derivedState.showStep0Errors,
      showStep1Errors: derivedState.showStep1Errors,
      showStep2Errors: derivedState.showStep2Errors,
      bannerError: derivedState.bannerError,
      errors: derivedState.errors,
    },
    actions: {
      setStep,
      setIsSuccessOpen,
      setAttemptedSteps,
      setDidAttemptSubmit,
      clearAllErrorsAfterChange,
      handleDrawerOpenChange,
      close,
      handleContinue,
      handleBackOrCancel,
      handleSubmit,
      handleCreateAnother,
      scrollToFirstInvalidInStep,
      findFirstInvalidStep: findInvalidStep,
      isStepValid: isCurrentStepValid,
      ...handlers,
    },
  } as const
}
