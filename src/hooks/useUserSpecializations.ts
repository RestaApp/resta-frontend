/**
 * Хук для работы со специализациями
 * Инкапсулирует логику работы со специализациями пользователей
 * Использует Redux как кеш для избежания повторных запросов
 */

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useGetUserSpecializationsQuery } from '@/services/api/usersApi'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectSpecializationsByPosition, setSpecializations } from '@/store/catalogSlice'

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

  // Получаем специализации из Redux кеша для данной позиции
  const cachedSpecializations = useAppSelector(selectSpecializationsByPosition(position || ''))
  const hasCachedData = cachedSpecializations.length > 0

  // Пропускаем запрос если:
  // 1. Не включен или не авторизован или нет позиции
  // 2. Данные уже есть в кеше для этой позиции (не делаем повторный запрос)
  const { data, isLoading, isFetching, error, refetch } = useGetUserSpecializationsQuery(
    position || '',
    {
      skip: !enabled || !isAuthenticated || !position || hasCachedData,
    }
  )

  // Сохраняем данные в Redux после успешной загрузки
  useEffect(() => {
    if (data?.data && data.data.length > 0 && position && !hasCachedData) {
      dispatch(setSpecializations({ position, specializations: data.data }))
    }
  }, [data, position, dispatch, hasCachedData])

  // Используем данные из кеша или из запроса
  const specializations = hasCachedData ? cachedSpecializations : (data?.data ?? [])

  return {
    specializations,
    isLoading: hasCachedData ? false : isLoading,
    isFetching: hasCachedData ? false : isFetching,
    error,
    refetch,
  }
}
