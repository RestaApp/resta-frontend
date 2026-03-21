export type StepIndex = 0 | 1 | 2

export type DrawerFieldErrors = Partial<
  Record<'location' | 'requirements' | 'description' | 'specializations', string>
>

export interface AddShiftDrawerFormState {
  title: string
  date: string | null
  startTime: string
  endTime: string
  location: string
  description: string
  requirements: string
  shiftType: 'vacancy' | 'replacement'
  position: string
  specializations: string[]
  submitError: string | null
  fieldErrors: DrawerFieldErrors
  timeRangeError: string | null
  dateError: string | null
  positionError: string | null
}

const normalizeRequiredText = (error: string | undefined, requiredFieldError: string) => {
  if (error === requiredFieldError) return ' '
  return error
}

export const isStepValid = (form: AddShiftDrawerFormState, targetStep: StepIndex): boolean => {
  if (targetStep === 0) {
    if (!form.title.trim()) return false
    if (form.shiftType === 'replacement') {
      return !!form.date && !!form.startTime && !!form.endTime && !form.timeRangeError && !form.dateError
    }
    return true
  }

  if (targetStep === 1) {
    if (!form.location.trim()) return false
    if (!form.position || !!form.positionError) return false
    return form.specializations.length > 0
  }

  if (targetStep === 2) {
    return !!form.description.trim() && !!form.requirements.trim()
  }

  return true
}

export const findFirstInvalidStep = (form: AddShiftDrawerFormState): StepIndex => {
  if (!form.title.trim()) return 0
  if (form.shiftType === 'replacement') {
    if (!form.date || form.dateError) return 0
    if (!form.startTime || !form.endTime || form.timeRangeError) return 0
  }
  if (!form.location.trim()) return 1
  if (!form.position || form.positionError) return 1
  if (form.position && form.specializations.length === 0) return 1
  if (!form.description.trim()) return 2
  if (!form.requirements.trim()) return 2
  return 2
}

export const buildDrawerErrorState = (params: {
  form: AddShiftDrawerFormState
  attemptedSteps: [boolean, boolean, boolean]
  didAttemptSubmit: boolean
  requiredFieldError: string
  t: (key: string, options?: Record<string, unknown>) => string
}) => {
  const { form, attemptedSteps, didAttemptSubmit, requiredFieldError, t } = params
  const requiredMarker = ' '
  const showErrors = didAttemptSubmit || !!form.submitError || Object.keys(form.fieldErrors ?? {}).length > 0
  const showStep0Errors = showErrors || attemptedSteps[0]
  const showStep1Errors = showErrors || attemptedSteps[1]
  const showStep2Errors = showErrors || attemptedSteps[2]

  const titleError = showStep0Errors && !form.title.trim() ? requiredMarker : undefined
  const dateFieldError = form.dateError ?? (showStep0Errors && !form.date ? requiredMarker : undefined)
  const startTimeError = showStep0Errors && !form.startTime ? requiredMarker : undefined
  const endTimeError =
    form.timeRangeError ?? (showStep0Errors && !form.endTime ? requiredMarker : undefined)
  const locationFieldError =
    normalizeRequiredText(form.fieldErrors.location, requiredFieldError) ??
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
    normalizeRequiredText(form.fieldErrors.description, requiredFieldError) ??
    (showStep2Errors && !form.description.trim() ? requiredMarker : undefined)
  const requirementsFieldError =
    normalizeRequiredText(form.fieldErrors.requirements, requiredFieldError) ??
    (showStep2Errors && !form.requirements.trim() ? requiredMarker : undefined)

  const hasMissingRequiredInStep =
    (showStep0Errors &&
      (!form.title.trim() ||
        (form.shiftType === 'replacement' && (!form.date || !form.startTime || !form.endTime)))) ||
    (showStep1Errors && (!form.location.trim() || !form.position || form.specializations.length === 0)) ||
    (showStep2Errors && (!form.description.trim() || !form.requirements.trim()))

  const bannerError =
    form.submitError ?? (showErrors && hasMissingRequiredInStep ? t('validation.fillRequired') : null)

  return {
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
  }
}
