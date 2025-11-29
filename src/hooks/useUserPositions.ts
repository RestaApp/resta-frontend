/**
 * Хук для работы с позициями (подролями сотрудников)
 * Инкапсулирует логику работы с позициями пользователей
 */

import { useEffect } from 'react'
import { useGetUserPositionsQuery } from '../services/api/usersApi'
import { mapEmployeeSubRolesFromApi } from '../utils/rolesMapper'
import type { PositionApiItem } from '../services/api/usersApi'
import { logger } from '../utils/logger'
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

  useEffect(() => {
    if (data) {
      logger.log('[useUserPositions] Данные получены:', {
        raw: positions,
        mapped: mappedPositions,
        count: mappedPositions.length,
      })
    }
    if (error) {
      logger.error('[useUserPositions] Ошибка загрузки позиций:', error)
    }
  }, [data, error, positions, mappedPositions])

  return {
    positions: mappedPositions,
    positionsApi: positions as PositionApiItem[],
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

