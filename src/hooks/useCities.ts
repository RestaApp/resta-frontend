/**
 * Хук для работы с городами
 * Инкапсулирует логику работы с городами из каталога
 * Использует кеш RTK Query для избежания повторных запросов
 */

import { useMemo } from 'react'
import { useGetCitiesQuery } from '@/services/api/usersApi'
import { useAuth } from '@/contexts/AuthContext'

interface UseCitiesOptions {
  /**
   * Включить загрузку городов
   */
  enabled?: boolean
}

/**
 * Хук для получения городов
 * Запрос выполняется только после успешной авторизации (получения токена)
 * @param options - Опции для управления загрузкой
 */
export const useCities = (options: UseCitiesOptions = {}) => {
  const { enabled = false } = options
  const { isAuthenticated } = useAuth()

  // Пропускаем запрос если не включен или не авторизован
  const { data, isLoading, isFetching, error, refetch } = useGetCitiesQuery(undefined, {
    skip: !enabled || !isAuthenticated,
  })

  const cities = useMemo(() => data?.data ?? [], [data])

  return {
    cities,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

