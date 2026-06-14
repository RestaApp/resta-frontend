import { useCallback, useState } from 'react'
import { triggerHapticFeedback } from '@/shared/utils/haptics'
import { formatPhoneInput, validatePhone } from '@/shared/utils/phone'
import { buildUpdateUserRequest, type ProfileFormData } from '../utils/buildUpdateUserRequest'
import type { ApiRole } from '@/shared/types/roles.types'

export type EditProfileField =
  | 'name'
  | 'lastName'
  | 'phone'
  | 'city'
  | 'position'
  | 'specializations'

export type EditProfileErrors = Partial<Record<EditProfileField, string>>
export type EditProfileStep = 0 | 1 | 2

interface UseEditProfileFormControllerParams {
  apiRole: ApiRole | null
  userId: number | undefined
  baseFormData: ProfileFormData
  initialStep: EditProfileStep | null
  onSuccess?: () => void
  updateUser: (
    id: number,
    data: ReturnType<typeof buildUpdateUserRequest>
  ) => Promise<{ success: boolean; errors?: string[] }>
  showToast: (message: string, variant?: 'success' | 'error' | 'warning' | 'info') => void
  t: (key: string, options?: { defaultValue?: string }) => string
}

const getTotalSteps = (apiRole: ApiRole | null) => {
  if (apiRole === 'employee' || apiRole === 'restaurant' || apiRole === 'supplier') return 3
  return 1
}

export const useEditProfileFormController = ({
  apiRole,
  userId,
  baseFormData,
  initialStep,
  onSuccess,
  updateUser,
  showToast,
  t,
}: UseEditProfileFormControllerParams) => {
  const [step, setStep] = useState<EditProfileStep>(initialStep ?? 0)
  const [draftFormData, setDraftFormData] = useState<ProfileFormData | null>(null)
  const [showCityWarning, setShowCityWarning] = useState(false)
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<EditProfileErrors>({})

  const formData = draftFormData ?? baseFormData
  const totalSteps = getTotalSteps(apiRole)

  const mapApiErrorsToFieldErrors = useCallback(
    (errors: string[] | undefined): EditProfileErrors => {
      if (!errors?.length) return {}

      const joined = errors.join(' ').toLowerCase()
      const nextErrors: EditProfileErrors = {}

      if (joined.includes('phone has already been taken')) {
        nextErrors.phone = t('phone.alreadyTaken')
      }

      return nextErrors
    },
    [t]
  )

  const buildValidationErrors = useCallback(
    (data: ProfileFormData, allowEmptyCity: boolean): EditProfileErrors => {
      const nextErrors: EditProfileErrors = {}

      if (!data.name.trim()) {
        nextErrors.name = t('validation.requiredField')
      }

      if (apiRole === 'employee' && !data.lastName.trim()) {
        nextErrors.lastName = t('validation.requiredField')
      }

      const phoneRaw = data.phone.trim()
      if (!phoneRaw) {
        nextErrors.phone = t('phone.required')
      } else {
        const phoneValidation = validatePhone(phoneRaw)
        if (!phoneValidation.valid) {
          nextErrors.phone = phoneValidation.message ?? t('phone.invalidFormat')
        }
      }

      if (!allowEmptyCity && !data.city.trim()) {
        nextErrors.city = t('validation.requiredField')
      }

      if (apiRole === 'employee') {
        if (!data.position.trim()) {
          nextErrors.position = t('validation.requiredField')
        }
        if (data.specializations.length === 0) {
          nextErrors.specializations = t('validation.specializationRequired')
        }
      }

      return nextErrors
    },
    [apiRole, t]
  )

  const buildStepValidationErrors = useCallback(
    (targetStep: EditProfileStep, data: ProfileFormData): EditProfileErrors => {
      if (targetStep === 0) {
        return buildValidationErrors(data, false)
      }

      if (apiRole === 'employee' && targetStep === 1) {
        const nextErrors: EditProfileErrors = {}
        if (!data.position.trim()) {
          nextErrors.position = t('validation.requiredField')
        }
        if (data.specializations.length === 0) {
          nextErrors.specializations = t('validation.specializationRequired')
        }
        return nextErrors
      }

      return {}
    },
    [apiRole, buildValidationErrors, t]
  )

  const performSave = useCallback(async () => {
    if (!userId) {
      showToast(t('errors.userNotFound'), 'error')
      return
    }

    const nextErrors = buildValidationErrors(formData, true)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      showToast(t('validation.fillRequired'), 'warning')
      return
    }

    try {
      const updateData = buildUpdateUserRequest(formData, apiRole, baseFormData)
      if (Object.keys(updateData.user).length === 0) {
        onSuccess?.()
        return
      }

      const result = await updateUser(userId, updateData)
      if (result.success) {
        showToast(t('errors.profileUpdateSuccess'), 'success')
        onSuccess?.()
        return
      }

      const apiFieldErrors = mapApiErrorsToFieldErrors(result.errors)
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...apiFieldErrors }))
        showToast(
          apiFieldErrors.phone || result.errors?.join(', ') || t('errors.profileUpdateError'),
          'error'
        )
        return
      }

      showToast(result.errors?.join(', ') || t('errors.profileUpdateError'), 'error')
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('errors.profileUpdateError'), 'error')
    }
  }, [
    apiRole,
    baseFormData,
    buildValidationErrors,
    formData,
    mapApiErrorsToFieldErrors,
    onSuccess,
    showToast,
    t,
    updateUser,
    userId,
  ])

  const handleSave = useCallback(async () => {
    setHasAttemptedSave(true)
    const nextErrors = buildValidationErrors(formData, false)
    setFieldErrors(nextErrors)

    const hasNonCityErrors = Object.entries(nextErrors).some(([key]) => key !== 'city')
    if (hasNonCityErrors) {
      showToast(t('validation.fillRequired'), 'warning')
      return
    }

    if (nextErrors.city) {
      triggerHapticFeedback('warning')
      setShowCityWarning(true)
      return
    }

    await performSave()
  }, [buildValidationErrors, formData, performSave, showToast, t])

  const handleNext = useCallback(() => {
    const nextErrors = buildStepValidationErrors(step, formData)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      triggerHapticFeedback('warning')
      showToast(t('validation.fillRequired'), 'warning')
      return
    }

    setStep(prev => Math.min(prev + 1, totalSteps - 1) as EditProfileStep)
  }, [buildStepValidationErrors, formData, showToast, step, t, totalSteps])

  const handleBack = useCallback(() => {
    setFieldErrors({})
    setStep(prev => Math.max(prev - 1, 0) as EditProfileStep)
  }, [])

  const updateField = useCallback(
    <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
      let nextFormData: ProfileFormData | null = null
      setDraftFormData(prev => {
        const base = prev ?? baseFormData
        const next: ProfileFormData = { ...base, [field]: value }
        if (field === 'phone' && typeof value === 'string') {
          next.phone = formatPhoneInput(value)
        }
        if (field === 'position' && value !== base.position) {
          next.specializations = []
        }
        nextFormData = next
        return next
      })

      if (!hasAttemptedSave || !nextFormData) return
      setFieldErrors(buildValidationErrors(nextFormData, false))
    },
    [baseFormData, buildValidationErrors, hasAttemptedSave]
  )

  const handleSaveWithoutCity = useCallback(async () => {
    setHasAttemptedSave(true)
    setShowCityWarning(false)
    await performSave()
  }, [performSave])

  const resetForm = useCallback(() => {
    setDraftFormData(null)
    setShowCityWarning(false)
    setHasAttemptedSave(false)
    setFieldErrors({})
    setStep(0)
  }, [])

  const openForm = useCallback(() => {
    setStep(initialStep ?? 0)
  }, [initialStep])

  return {
    formData,
    step,
    totalSteps,
    showCityWarning,
    setShowCityWarning,
    fieldErrors,
    handleNext,
    handleBack,
    handleSave,
    updateField,
    handleSaveWithoutCity,
    resetForm,
    openForm,
  }
}
