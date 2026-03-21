import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useUpdateUser } from '@/hooks/useUsers'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useToast } from '@/hooks/useToast'
import { useCities } from '@/hooks/useCities'
import { mapRoleFromApi } from '@/utils/roles'
import { invalidateUserCache } from '@/utils/userData'
import { useAppDispatch } from '@/store/hooks'
import type { ApiRole } from '@/types'
import { buildUpdateUserRequest, type ProfileFormData } from '../utils/buildUpdateUserRequest'
import { formatPhoneInput, validatePhone } from '@/utils/phone'

type EditProfileField = 'name' | 'lastName' | 'phone' | 'city'
type EditProfileErrors = Partial<Record<EditProfileField, string>>

export const useEditProfileModel = (open: boolean, onSuccess?: () => void) => {
  const { t } = useTranslation()
  const { userProfile, refetch } = useUserProfile()
  const { updateUser, isLoading } = useUpdateUser()
  const { showToast } = useToast()
  const { cities, isLoading: isCitiesLoading } = useCities({ enabled: open })
  const dispatch = useAppDispatch()

  // Определяем роль
  const apiRole = useMemo<ApiRole | null>(() => {
    const roleValue = userProfile?.role
    if (!roleValue) return null
    return mapRoleFromApi(roleValue)
  }, [userProfile?.role])

  const baseFormData = useMemo<ProfileFormData>(() => {
    if (!userProfile) {
      return {
        name: '',
        lastName: '',
        bio: '',
        city: '',
        location: '',
        email: '',
        phone: '',
        workExperienceSummary: '',
        experienceYears: '',
        openToWork: false,
        skills: '',
      }
    }

    const ep = userProfile.employee_profile
    return {
      name: userProfile.name || '',
      lastName: userProfile.last_name || '',
      bio: userProfile.bio || '',
      city: userProfile.city ?? '',
      location: userProfile.location ?? '',
      email: userProfile.email || '',
      phone: formatPhoneInput(userProfile.phone || '') || userProfile.phone || '',
      workExperienceSummary: userProfile.work_experience_summary || '',
      experienceYears:
        apiRole === 'employee' && ep
          ? typeof ep.experience_years === 'number'
            ? ep.experience_years
            : ''
          : '',
      openToWork: apiRole === 'employee' && ep ? ep.open_to_work || false : false,
      skills: apiRole === 'employee' && ep?.skills ? ep.skills.join(', ') : '',
    }
  }, [apiRole, userProfile])

  const [draftFormData, setDraftFormData] = useState<ProfileFormData | null>(null)
  const formData = draftFormData ?? baseFormData

  // Состояние для модалки подтверждения сохранения без города
  const [showCityWarning, setShowCityWarning] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<EditProfileErrors>({})

  const buildValidationErrors = useCallback(
    (allowEmptyCity: boolean): EditProfileErrors => {
      const nextErrors: EditProfileErrors = {}

      if (!formData.name.trim()) {
        nextErrors.name = t('validation.requiredField')
      }

      if (apiRole === 'employee' && !formData.lastName.trim()) {
        nextErrors.lastName = t('validation.requiredField')
      }

      const phoneRaw = formData.phone.trim()
      if (!phoneRaw) {
        nextErrors.phone = t('phone.required')
      } else {
        const phoneValidation = validatePhone(phoneRaw)
        if (!phoneValidation.valid) {
          nextErrors.phone = phoneValidation.message ?? t('phone.invalidFormat')
        }
      }

      if (!allowEmptyCity && !formData.city.trim()) {
        nextErrors.city = t('validation.requiredField')
      }

      return nextErrors
    },
    [apiRole, formData, t]
  )

  const performSave = useCallback(async () => {
    if (!userProfile?.id) {
      showToast(t('errors.userNotFound'), 'error')
      return
    }

    const nextErrors = buildValidationErrors(true)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      showToast(t('validation.fillRequired'), 'error')
      return
    }

    try {
      const updateData = buildUpdateUserRequest(formData, apiRole)
      const result = await updateUser(userProfile.id, updateData)
      if (result.success && result.data) {
        showToast(t('errors.profileUpdateSuccess'), 'success')
        invalidateUserCache(dispatch)
        setTimeout(() => refetch().catch(() => {}), 300)
        onSuccess?.()
      } else {
        showToast(result.errors?.join(', ') || t('errors.profileUpdateError'), 'error')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('errors.profileUpdateError'), 'error')
    }
  }, [
    userProfile,
    formData,
    apiRole,
    updateUser,
    showToast,
    refetch,
    onSuccess,
    dispatch,
    t,
    buildValidationErrors,
  ])

  const handleSave = useCallback(async () => {
    const nextErrors = buildValidationErrors(false)
    setFieldErrors(nextErrors)

    const hasNonCityErrors = Object.entries(nextErrors).some(([key]) => key !== 'city')
    if (hasNonCityErrors) {
      showToast(t('validation.fillRequired'), 'error')
      return
    }

    if (nextErrors.city) {
      setShowCityWarning(true)
      return
    }
    await performSave()
  }, [buildValidationErrors, performSave, showToast, t])

  const updateField = useCallback(
    <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
      setDraftFormData(prev => {
        const base = prev ?? baseFormData
        const next: ProfileFormData = { ...base, [field]: value }
        if (field === 'phone' && typeof value === 'string') {
          next.phone = formatPhoneInput(value)
        }
        return next
      })
      setFieldErrors(prev => {
        if (!(field in prev)) return prev
        const next = { ...prev }
        delete next[field as EditProfileField]
        return next
      })
    },
    [baseFormData]
  )

  const handleSaveWithoutCity = useCallback(async () => {
    setShowCityWarning(false)
    await performSave()
  }, [performSave])

  const experienceYearsForSlider =
    typeof formData.experienceYears === 'number' ? formData.experienceYears : 0

  const resetForm = useCallback(() => {
    setDraftFormData(null)
    setShowCityWarning(false)
    setFieldErrors({})
  }, [])

  return {
    userProfile,
    apiRole,
    formData,
    cities,
    isCitiesLoading,
    isLoading,
    experienceYearsForSlider,
    handleSave,
    updateField,
    showCityWarning,
    setShowCityWarning,
    fieldErrors,
    handleSaveWithoutCity,
    resetForm,
  }
}
