/**
 * Хук для проверки полноты профиля пользователя
 * Определяет, заполнены ли все обязательные поля профиля
 */

import { useMemo } from 'react'
import { useUserProfile } from './useUserProfile'
import { mapRoleFromApi } from '@/utils/roles'
import type { ApiRole } from '@/types'

/**
 * Проверяет полноту профиля пользователя
 * @returns Объект с информацией о полноте профиля
 */
export const useProfileCompleteness = () => {
  const { userProfile } = useUserProfile()

  const completeness = useMemo(() => {
    if (!userProfile) {
      return {
        isComplete: false,
        hasIncompleteFields: true,
      }
    }

    // Определяем роль пользователя
    const apiRole: ApiRole | null = userProfile.role ? mapRoleFromApi(userProfile.role) : null

    // Обязательные поля для проверки полноты профиля
    const hasPhone = !!userProfile.phone
    const hasCity = !!(userProfile.location || (userProfile as any).city)
    const hasLastName = apiRole === 'employee' ? !!userProfile.last_name : true // Для employee обязательно

    // Проверяем, что все обязательные поля заполнены
    const isComplete = hasPhone && hasCity && hasLastName

    return {
      isComplete,
      hasIncompleteFields: !isComplete,
    }
  }, [userProfile])

  return completeness
}
