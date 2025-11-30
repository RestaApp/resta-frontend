/**
 * Хук для получения данных профиля пользователя из API
 */

import { useAuth } from '../contexts/AuthContext'
import { useGetUserQuery } from '../services/api/usersApi'
import { useAppSelector } from '../store/hooks'

interface UseUserProfileOptions {
  /**
   * Пропустить запрос, если пользователь не авторизован
   */
  skip?: boolean
}

/**
 * Хук для получения данных профиля пользователя
 * @param options - Опции для управления загрузкой
 */
export function useUserProfile(options: UseUserProfileOptions = {}) {
  const { skip = false } = options
  const { isAuthenticated } = useAuth()
  const userDataFromStore = useAppSelector(state => state.user.userData)

  // Получаем userId из store или из userData
  const userId = userDataFromStore?.id

  // Пропускаем запрос если не авторизован, нет userId или skip=true
  const { data, isLoading, isFetching, error, refetch } = useGetUserQuery(userId ?? 0, {
    skip: skip || !isAuthenticated || !userId,
  })

  const userProfile = data?.data ?? null

  return {
    userProfile,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

