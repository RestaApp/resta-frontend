/**
 * Хук для получения данных профиля пользователя из API
 * Использует данные из Redux в первую очередь, загружает из API только при необходимости
 */

import { useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useGetUserQuery } from '@/services/api/usersApi'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateUserDataInStore } from '@/utils/userData'

interface UseUserProfileOptions {
  /**
   * Пропустить запрос, если пользователь не авторизован
   */
  skip?: boolean
  /**
   * Принудительно загрузить данные из API, даже если они есть в Redux
   */
  forceRefetch?: boolean
}

/**
 * Хук для получения данных профиля пользователя
 * Приоритет: данные из Redux > данные из API
 * @param options - Опции для управления загрузкой
 */
export const useUserProfile = (options: UseUserProfileOptions = {}) => {
  const { skip = false, forceRefetch = false } = options
  const { isAuthenticated } = useAuth()
  const dispatch = useAppDispatch()
  const userDataFromStore = useAppSelector(state => state.user.userData)

  // Получаем userId из store
  const userId = userDataFromStore?.id

  // Пропускаем запрос если:
  // - skip=true
  // - не авторизован
  // - нет userId
  // - данные уже есть в Redux и не требуется принудительная загрузка
  const shouldSkipQuery =
    skip || !isAuthenticated || !userId || (!!userDataFromStore && !forceRefetch)

  const { data, isLoading, isFetching, error, refetch } = useGetUserQuery(userId ?? 0, {
    skip: shouldSkipQuery,
  })

  const userProfileFromApi = data?.data ?? null

  // Автоматически сохраняем загруженные данные в Redux store
  useEffect(() => {
    if (userProfileFromApi && userProfileFromApi.id) {
      // Обновляем данные в store только если они действительно загружены из API
      updateUserDataInStore(dispatch, userProfileFromApi)
    }
  }, [userProfileFromApi, dispatch])

  // Используем данные из Redux в первую очередь, если они есть
  // Иначе используем данные из API
  const userProfile = useMemo(() => {
    if (userDataFromStore && userDataFromStore.id) {
      return userDataFromStore
    }
    return userProfileFromApi
  }, [userDataFromStore, userProfileFromApi])

  // Функция для принудительного обновления данных
  const refetchAndUpdate = async () => {
    if (userId) {
      const result = await refetch()
      if (result.data?.data) {
        updateUserDataInStore(dispatch, result.data.data)
      }
      return result
    }
  }

  return {
    userProfile,
    isLoading: shouldSkipQuery ? false : isLoading,
    isFetching: shouldSkipQuery ? false : isFetching,
    error,
    refetch: refetchAndUpdate,
  }
}
