/**
 * Хук для работы с городами.
 * Single source of truth — RTK Query cache.
 */

import { useGetCitiesQuery } from '@/services/api/usersApi'
import { useAuth } from '@/app/contexts/auth'

interface UseCitiesOptions {
  /**
   * Включить загрузку городов
   */
  enabled?: boolean
}

/**
 * Хук для получения городов
 * Приоритет: данные из Redux > данные из API
 * Запрос выполняется только после успешной авторизации (получения токена)
 * @param options - Опции для управления загрузкой
 */
export const useCities = (options: UseCitiesOptions = {}) => {
  const { enabled = false } = options
  const { isAuthenticated } = useAuth()
  const shouldSkipQuery = !enabled || !isAuthenticated

  const { data, isLoading, isFetching, error, refetch } = useGetCitiesQuery(undefined, {
    skip: shouldSkipQuery,
  })

  const cities = data?.data ?? []

  return {
    cities,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
