import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { ShiftType } from '@/features/activity/model/hooks/useAddShiftForm'

export type StepIndex = 0 | 1 | 2

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
    fieldErrors: Partial<Record<'location' | 'requirements' | 'description' | 'specializations', string>>
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

  const showErrors =
    didAttemptSubmit || !!form.submitError || Object.keys(form.fieldErrors ?? {}).length > 0
  const showStep0Errors = showErrors || attemptedSteps[0]
  const showStep1Errors = showErrors || attemptedSteps[1]
  const showStep2Errors = showErrors || attemptedSteps[2]

  const requiredFieldError = t('validation.requiredField')
  const requiredMarker = ' '
  const normalizeRequiredText = useCallback(
    (err?: string) => (err === requiredFieldError ? requiredMarker : err),
    [requiredFieldError]
  )

  const titleError = showStep0Errors && !form.title.trim() ? requiredMarker : undefined
  const dateFieldError = form.dateError ?? (showStep0Errors && !form.date ? requiredMarker : undefined)
  const startTimeError = showStep0Errors && !form.startTime ? requiredMarker : undefined
  const endTimeError =
    form.timeRangeError ?? (showStep0Errors && !form.endTime ? requiredMarker : undefined)
  const locationFieldError =
    normalizeRequiredText(form.fieldErrors.location) ??
    (showStep1Errors && !form.location.trim() ? requiredMarker : undefined)
  const positionFieldError =
    form.positionError ?? (showStep1Errors && !form.position ? requiredMarker : undefined)

  const canValidateSpecializations = !!form.position && !form.positionError
  const specializationFieldError =
    (form.fieldErrors.specializations ? requiredMarker : undefined) ??
    (canValidateSpecializations && showStep1Errors && form.specializations.length === 0
      ? requiredMarker
      : undefined)
  const descriptionFieldError =
    normalizeRequiredText(form.fieldErrors.description) ??
    (showStep2Errors && !form.description.trim() ? requiredMarker : undefined)
  const requirementsFieldError =
    normalizeRequiredText(form.fieldErrors.requirements) ??
    (showStep2Errors && !form.requirements.trim() ? requiredMarker : undefined)

  const hasMissingRequiredInStep =
    step === 0
      ? !form.title.trim() || !form.date || !form.startTime || !form.endTime
      : step === 1
        ? !form.location.trim() || !form.position || form.specializations.length === 0
        : !form.description.trim() || !form.requirements.trim()

  const bannerError = form.submitError ?? (showErrors && hasMissingRequiredInStep ? t('validation.fillRequired') : null)

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

  const handleTitleChange = useMemo(() => wrapStringSetter(form.setTitle), [form.setTitle, wrapStringSetter])
  const handleStartTimeChange = useMemo(
    () => wrapStringSetter(form.setStartTime),
    [form.setStartTime, wrapStringSetter]
  )
  const handleEndTimeChange = useMemo(
    () => wrapStringSetter(form.setEndTime),
    [form.setEndTime, wrapStringSetter]
  )
  const handlePayChange = useMemo(() => wrapStringSetter(form.setPay), [form.setPay, wrapStringSetter])
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
  const handleUrgentChange = useMemo(() => wrapBooleanSetter(form.setUrgent), [form.setUrgent, wrapBooleanSetter])
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
        if (!form.date || form.dateError) return scrollTo(dateRef)
        if (!form.startTime || !form.endTime || form.timeRangeError) return scrollTo(timeRef)
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

  const findFirstInvalidStep = useCallback((): StepIndex => {
    if (!form.title.trim()) return 0
    if (!form.date || form.dateError) return 0
    if (!form.startTime || !form.endTime || form.timeRangeError) return 0
    if (!form.location.trim()) return 1
    if (!form.position || form.positionError) return 1
    if (form.position && form.specializations.length === 0) return 1
    if (!form.description.trim()) return 2
    if (!form.requirements.trim()) return 2
    return 2
  }, [form])

  const isStepValid = useCallback(
    (targetStep: StepIndex): boolean => {
      if (targetStep === 0) {
        return (
          !!form.title.trim() &&
          !!form.date &&
          !!form.startTime &&
          !!form.endTime &&
          !form.timeRangeError &&
          !form.dateError
        )
      }
      if (targetStep === 1) {
        if (!form.location.trim()) return false
        if (!form.position || !!form.positionError) return false
        if (form.specializations.length === 0) return false
        return true
      }
      if (targetStep === 2) {
        if (!form.description.trim()) return false
        if (!form.requirements.trim()) return false
        return true
      }
      return true
    },
    [form]
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

    if (isStepValid(step)) setStep(prev => (prev < 2 ? ((prev + 1) as StepIndex) : prev))
    else scrollToFirstInvalidInStep(step)
  }, [isStepValid, scrollToFirstInvalidInStep, step])

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
    const invalidStep = findFirstInvalidStep()
    setStep(invalidStep)
    setAttemptedSteps([true, true, true])
    setTimeout(() => scrollToFirstInvalidInStep(invalidStep), 0)
  }, [close, findFirstInvalidStep, form, initialValues?.id, scrollToFirstInvalidInStep])

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
      findFirstInvalidStep,
      isStepValid,
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

