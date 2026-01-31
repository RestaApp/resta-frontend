import { useState, useCallback, useEffect, useMemo } from 'react'
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

export const useEditProfileModel = (open: boolean, onSuccess?: () => void) => {
  const { userProfile, refetch } = useUserProfile()
  const { updateUser, isLoading } = useUpdateUser()
  const { showToast } = useToast()
  const { cities, isLoading: isCitiesLoading } = useCities({ enabled: open })
  const dispatch = useAppDispatch()

  // Определяем роль
  const apiRole = useMemo<ApiRole | null>(() => {
    if (!userProfile?.role) return null
    return mapRoleFromApi(userProfile.role)
  }, [userProfile?.role])

  // Состояние формы
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    lastName: '',
    bio: '',
    city: '',
    email: '',
    phone: '',
    workExperienceSummary: '',
    experienceYears: '',
    openToWork: false,
    skills: '',
  })

  // Инициализация формы при открытии
  useEffect(() => {
    if (!open || !userProfile) return
    const ep = userProfile.employee_profile
    setFormData({
      name: userProfile.name || '',
      lastName: userProfile.last_name || '',
      bio: userProfile.bio || '',
      city: userProfile.city ?? userProfile.location ?? '',
      email: userProfile.email || '',
      phone: formatPhoneInput(userProfile.phone || '') || userProfile.phone || '',
      workExperienceSummary: userProfile.work_experience_summary || '',
      experienceYears: apiRole === 'employee' && ep ? (typeof ep.experience_years === 'number' ? ep.experience_years : '') : '',
      openToWork: apiRole === 'employee' && ep ? ep.open_to_work || false : false,
      skills: apiRole === 'employee' && ep?.skills ? ep.skills.join(', ') : '',
    })
  }, [open, userProfile, apiRole])

  // Состояние для модалки подтверждения сохранения без города
  const [showCityWarning, setShowCityWarning] = useState(false)

  const performSave = useCallback(async () => {
    if (!userProfile?.id) {
      showToast('Ошибка: пользователь не найден', 'error')
      return
    }
    const phoneValidation = validatePhone(formData.phone)
    if (!phoneValidation.valid) {
      showToast(phoneValidation.message ?? 'Неверный формат телефона', 'error')
      return
    }
    try {
      const updateData = buildUpdateUserRequest(formData, apiRole)
      const result = await updateUser(userProfile.id, updateData)
      if (result.success && result.data) {
        showToast('Профиль успешно обновлен', 'success')
        invalidateUserCache(dispatch)
        setTimeout(() => refetch().catch(() => {}), 300)
        onSuccess?.()
      } else {
        showToast(result.errors?.join(', ') || 'Не удалось обновить профиль', 'error')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Не удалось обновить профиль', 'error')
    }
  }, [userProfile, formData, apiRole, updateUser, showToast, refetch, onSuccess, dispatch])

  const handleSave = useCallback(async () => {
    if (!formData.city?.trim()) {
      setShowCityWarning(true)
      return
    }
    await performSave()
  }, [formData.city, performSave])

  const updateField = useCallback(<K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'phone' && typeof value === 'string') {
        next.phone = formatPhoneInput(value)
      }
      return next
    })
  }, [])

  const handleSaveWithoutCity = useCallback(async () => {
    setShowCityWarning(false)
    await performSave()
  }, [performSave])

  const experienceYearsForSlider =
    typeof formData.experienceYears === 'number' ? formData.experienceYears : 0

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
    handleSaveWithoutCity,
  }
}
