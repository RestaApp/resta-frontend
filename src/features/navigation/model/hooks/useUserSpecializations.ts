/**
 * Хук для работы со специализациями
 * Инкапсулирует логику работы со специализациями пользователей
 * Использует Redux как кеш для избежания повторных запросов
 */

import { useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/auth'
import { useGetUserSpecializationsQuery } from '@/services/api/usersApi'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  setSpecializations,
  selectSpecializationsByPosition,
} from '@/features/navigation/model/catalogSlice'

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
  const dispatch = useAppDispatch()

  // Нормализуем позицию к lowercase для консистентности
  const normalizedPosition = useMemo(() => (position || '').trim().toLowerCase(), [position])

  // Получаем специализации из Redux кеша для данной позиции
  const cachedSpecializations = useAppSelector(state =>
    selectSpecializationsByPosition(state, normalizedPosition)
  )

  // Проверяем наличие данных в кеше для текущей позиции
  const hasCachedData = normalizedPosition ? cachedSpecializations.length > 0 : false

  // Пропускаем запрос если:
  // 1. Не включен или не авторизован или нет позиции
  // 2. Данные уже есть в Redux кеше для этой позиции (не делаем повторный запрос)
  const shouldSkipQuery = !enabled || !isAuthenticated || !normalizedPosition || hasCachedData

  // Выполняем запрос к API
  const { currentData, isLoading, isFetching, error, refetch } = useGetUserSpecializationsQuery(
    normalizedPosition,
    {
      skip: shouldSkipQuery,
      // Принудительно обновляем при изменении позиции
      refetchOnMountOrArgChange: true,
    }
  )

  // Сохраняем данные в Redux после успешной загрузки
  useEffect(() => {
    if (
      currentData?.data &&
      currentData.data.length > 0 &&
      normalizedPosition &&
      !hasCachedData &&
      !shouldSkipQuery
    ) {
      dispatch(
        setSpecializations({
          position: normalizedPosition,
          specializations: currentData.data,
        })
      )
    }
  }, [currentData, normalizedPosition, dispatch, hasCachedData, shouldSkipQuery])

  const specializations = useMemo(() => {
    if (!normalizedPosition) return []

    // Приоритет 1: данные из Redux кеша (если есть)
    if (hasCachedData && cachedSpecializations.length > 0) {
      return cachedSpecializations
    }

    // Приоритет 2: данные из запроса (если есть)
    if (currentData?.data && currentData.data.length > 0) {
      return currentData.data
    }

    return []
  }, [normalizedPosition, hasCachedData, cachedSpecializations, currentData?.data])

  return {
    specializations,
    isLoading: hasCachedData ? false : isLoading,
    isFetching: hasCachedData ? false : isFetching,
    error,
    refetch,
  }
}
