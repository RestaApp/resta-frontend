/**
 * Хук для работы с позициями (подролями сотрудников).
 * Single source of truth — RTK Query cache.
 */

import { useGetUserPositionsQuery } from '@/services/api/usersApi'
import { mapEmployeeSubRolesFromApi } from '@/shared/utils/roleMappers'
import { useAuth } from '@/app/contexts/auth'

interface UseUserPositionsOptions {
  /**
   * Загружать позиции только если выбрана роль employee (chef)
   */
  enabled?: boolean
}

/**
 * Хук для получения позиций (подролей сотрудников)
 * Сначала проверяет Redux кеш, затем делает запрос если данных нет
 * Запрос выполняется только после успешной авторизации (получения токена)
 * @param options - Опции для управления загрузкой
 */
export const useUserPositions = (options: UseUserPositionsOptions = {}) => {
  const { enabled = false } = options
  const { isAuthenticated } = useAuth()
  const { data, isLoading, isFetching, error, refetch } = useGetUserPositionsQuery(undefined, {
    skip: !enabled || !isAuthenticated,
  })

  const positionsApi = data?.data ?? []
  const mappedPositions = mapEmployeeSubRolesFromApi(positionsApi)

  return {
    positions: mappedPositions,
    positionsApi,
    isLoading,
    isFetching,
    error,
    refetch,
  }
}
