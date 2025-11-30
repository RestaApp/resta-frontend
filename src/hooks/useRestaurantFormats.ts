/**
 * Хук для работы с форматами ресторанов
 * Инкапсулирует логику работы с форматами ресторанов
 */

import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useGetRestaurantFormatsQuery } from '../services/api/rolesApi'
import { logger } from '../utils/logger'
import type { RoleApiItem } from '../services/api/rolesApi'

interface UseRestaurantFormatsOptions {
  /**
   * Загружать форматы ресторанов только если включено
   */
  enabled?: boolean
}

/**
 * Хук для получения форматов ресторанов
 * Запрос выполняется только после успешной авторизации (получения токена)
 * @param options - Опции для управления загрузкой
 */
export function useRestaurantFormats(options: UseRestaurantFormatsOptions = {}) {
  const { enabled = false } = options
  const { isAuthenticated } = useAuth()

  // Пропускаем запрос до получения токена или если не включен
  const { data, isLoading, isFetching, error, refetch } = useGetRestaurantFormatsQuery(undefined, {
    skip: !enabled || !isAuthenticated,
  })

  const restaurantFormats = data?.data ?? []

  useEffect(() => {
    if (data) {
      logger.log('[useRestaurantFormats] Данные получены:', {
        raw: restaurantFormats,
        count: restaurantFormats.length,
      })
    }
    if (error) {
      logger.error('[useRestaurantFormats] Ошибка загрузки форматов ресторанов:', error)
    }
  }, [data, error, restaurantFormats])

  return {
    restaurantFormats: restaurantFormats as RoleApiItem[],
    isLoading,
    isFetching,
    error,
    refetch,
  }
}

