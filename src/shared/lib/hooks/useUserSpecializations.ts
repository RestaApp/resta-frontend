/**
 * Хук для работы со специализациями пользователей.
 * Single source of truth — RTK Query cache.
 */

import { useMemo } from 'react'
import { useAuth } from '@/app/contexts/auth'
import { normalizeCatalogPosition } from '@/shared/utils/roles'
import { useGetUserSpecializationsQuery } from '@/services/api/usersApi'

interface UseUserSpecializationsOptions {
  /**
   * Позиция для получения специализаций
   */
  position: string | null
  /**
   * Загружать специализации только если включено
   */
  enabled?: boolean
}

/**
 * Хук для получения специализаций для позиции
 * Сначала проверяет Redux кеш, затем делает запрос если данных нет
 * Запрос выполняется только после успешной авторизации (получения токена)
 * @param options - Опции для управления загрузкой
 */
export const useUserSpecializations = (options: UseUserSpecializationsOptions) => {
  const { enabled = false, position } = options
  const { isAuthenticated } = useAuth()

  const normalizedPosition = useMemo(() => normalizeCatalogPosition(position || ''), [position])
  const shouldSkipQuery = !enabled || !isAuthenticated || !normalizedPosition

  const { data, isLoading, isFetching, error, refetch } = useGetUserSpecializationsQuery(
    normalizedPosition,
    {
      skip: shouldSkipQuery,
      refetchOnMountOrArgChange: true,
    }
  )

  const specializations = data?.data ?? []

  return {
    specializations,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
