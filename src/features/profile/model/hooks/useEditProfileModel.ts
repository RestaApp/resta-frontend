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
    if (open && userProfile) {
      setFormData({
        name: userProfile.name || '',
        lastName: userProfile.last_name || '',
        bio: userProfile.bio || '',
        city: (userProfile as any).city || userProfile.location || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        workExperienceSummary: userProfile.work_experience_summary || '',
        experienceYears: apiRole === 'employee' && userProfile.employee_profile
          ? ((): number | '' => {
              const v = (userProfile.employee_profile as any).experience_years
              return typeof v === 'number' ? v : ''
            })()
          : '',
        openToWork: apiRole === 'employee' && userProfile.employee_profile
          ? userProfile.employee_profile.open_to_work || false
          : false,
        skills: apiRole === 'employee' && userProfile.employee_profile?.skills
          ? userProfile.employee_profile.skills.join(', ')
          : '',
      })
    }
  }, [open, userProfile, apiRole])

  // Обработка сохранения
  const handleSave = useCallback(async () => {
    if (!userProfile?.id) {
      showToast('Ошибка: пользователь не найден', 'error')
      return
    }

    try {
      const updateData = buildUpdateUserRequest(formData, apiRole)
      const result = await updateUser(userProfile.id, updateData)

      if (result.success && result.data) {
        showToast('Профиль успешно обновлен', 'success')
        // Принудительно инвалидируем кеш User, чтобы обновить данные везде
        invalidateUserCache(dispatch)
        // Делаем refetch для синхронизации с сервером
        setTimeout(() => {
          refetch().catch(() => {
            // Игнорируем ошибки refetch, данные уже в Redux
          })
        }, 300)
        onSuccess?.()
      } else {
        const errorMessage = result.errors?.join(', ') || 'Не удалось обновить профиль'
        showToast(errorMessage, 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось обновить профиль'
      showToast(errorMessage, 'error')
    }
  }, [userProfile, formData, apiRole, updateUser, showToast, refetch, onSuccess, dispatch])

  const updateField = useCallback(<K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  return {
    userProfile,
    apiRole,
    formData,
    cities,
    isCitiesLoading,
    isLoading,
    handleSave,
    updateField,
  }
}
