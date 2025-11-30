/**
 * Хук для работы с позициями (подролями сотрудников)
 * Инкапсулирует логику работы с позициями пользователей
 */

import { useGetUserPositionsQuery } from '../services/api/usersApi'
import { mapEmployeeSubRolesFromApi } from '../utils/rolesMapper'
import type { PositionApiItem } from '../services/api/usersApi'
import { useAuth } from '../contexts/AuthContext'

interface UseUserPositionsOptions {
  /**
   * Загружать позиции только если выбрана роль employee (chef)
   */
  enabled?: boolean
}

/**
 * Хук для получения позиций (подролей сотрудников)
 * Запрос выполняется только после успешной авторизации (получения токена)
 * @param options - Опции для управления загрузкой
 */
export function useUserPositions(options: UseUserPositionsOptions = {}) {
  const { enabled = false } = options
  const { isAuthenticated } = useAuth()

  // Пропускаем запрос до получения токена или если не включен
  const { data, isLoading, isFetching, error, refetch } = useGetUserPositionsQuery(undefined, {
    skip: !enabled || !isAuthenticated,
  })

  const positions = data?.data ?? []
  const mappedPositions = mapEmployeeSubRolesFromApi(positions as PositionApiItem[])

  return {
    positions: mappedPositions,
    positionsApi: positions as PositionApiItem[],
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

