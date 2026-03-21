import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { ShiftType } from '@/features/activity/model/hooks/useAddShiftForm'
import {
  buildDrawerErrorState,
  findFirstInvalidStep,
  isStepValid,
  type AddShiftDrawerFormState,
  type StepIndex,
} from './validation'

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
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

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
  const {
    showErrors,
    showStep0Errors,
    showStep1Errors,
    showStep2Errors,
    bannerError,
    errors: {
      titleError,
      dateFieldError,
      startTimeError,
      endTimeError,
      locationFieldError,
      positionFieldError,
      specializationFieldError,
      descriptionFieldError,
      requirementsFieldError,
    },
  } = derivedState

  const clearAllErrorsAfterChange = useCallback(() => {
    form.clearSubmitError()
    if (didAttemptSubmit) setDidAttemptSubmit(false)
    if (attemptedSteps[0] || attemptedSteps[1] || attemptedSteps[2]) {
      setAttemptedSteps([false, false, false])
    }
  }, [attemptedSteps, didAttemptSubmit, form])

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
    () => wrapStringSetter(form.setLocation),
    [form.setLocation, wrapStringSetter]
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
    [form, onOpenChange]
  )

  const close = useCallback(() => handleDrawerOpenChange(false), [handleDrawerOpenChange])

  useEffect(() => {
    if (!open) return
    if (!isSuccessOpen) return
    const id = window.setTimeout(() => close(), 3000)
    return () => window.clearTimeout(id)
  }, [close, isSuccessOpen, open])

  const handleContinue = useCallback(() => {
    setAttemptedSteps(prev => {
      const next: [boolean, boolean, boolean] = [...prev] as [boolean, boolean, boolean]
      next[step] = true
      return next
    })

    if (isCurrentStepValid(step)) setStep(prev => (prev < 2 ? ((prev + 1) as StepIndex) : prev))
    else scrollToFirstInvalidInStep(step)
  }, [isCurrentStepValid, scrollToFirstInvalidInStep, step])

  const handleBackOrCancel = useCallback(() => {
    if (step === 0) {
      close()
      return
    }
    clearAllErrorsAfterChange()
    setStep(prev => (prev > 0 ? ((prev - 1) as StepIndex) : prev))
  }, [clearAllErrorsAfterChange, close, step])

  const handlePositionChange = useCallback(
    (next: string) => {
      clearAllErrorsAfterChange()
      if (next !== form.position && form.specializations.length > 0) form.setSpecializations([])
      if (!next && form.specializations.length > 0) form.setSpecializations([])
      form.setPosition(next)
    },
    [clearAllErrorsAfterChange, form]
  )

  const handleSubmit = useCallback(async () => {
    setDidAttemptSubmit(true)
    const ok = await form.handleSave()
    if (ok) {
      if (initialValues?.id) close()
      else setIsSuccessOpen(true)
      return
    }
    const invalidStep = findInvalidStep()
    setStep(invalidStep)
    setAttemptedSteps([true, true, true])
    setTimeout(() => scrollToFirstInvalidInStep(invalidStep), 0)
  }, [close, findInvalidStep, form, initialValues?.id, scrollToFirstInvalidInStep])

  const handleCreateAnother = useCallback(() => {
    setIsSuccessOpen(false)
    setStep(0)
    setAttemptedSteps([false, false, false])
    setDidAttemptSubmit(false)
  }, [])

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
      showErrors,
      showStep0Errors,
      showStep1Errors,
      showStep2Errors,
      bannerError,
      errors: {
        titleError,
        dateFieldError,
        startTimeError,
        endTimeError,
        locationFieldError,
        positionFieldError,
        specializationFieldError,
        descriptionFieldError,
        requirementsFieldError,
      },
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
      handleTitleChange,
      handleDateChange,
      handleStartTimeChange,
      handleEndTimeChange,
      handlePayChange,
      handleLocationChange,
      handleShiftTypeChange,
      handlePositionChange,
      handleSpecializationsChange,
      handleDescriptionChange,
      handleRequirementsChange,
      handleUrgentChange,
    },
  } as const
}
