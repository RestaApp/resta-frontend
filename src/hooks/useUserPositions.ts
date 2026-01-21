/**
 * Хук для работы с позициями (подролями сотрудников)
 * Инкапсулирует логику работы с позициями пользователей
 * Использует Redux как кеш для избежания повторных запросов
 */

import { useEffect } from 'react'
import { useGetUserPositionsQuery } from '@/services/api/usersApi'
import { mapEmployeeSubRolesFromApi } from '@/features/role-selector/utils/mappers'
import { useAuth } from '@/contexts/AuthContext'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectPositions, setPositions } from '@/features/navigation/model/catalogSlice'

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
  const dispatch = useAppDispatch()
  
  // Получаем позиции из Redux кеша
  const cachedPositions = useAppSelector(selectPositions)
  const hasCachedData = cachedPositions.length > 0

  // Пропускаем запрос если:
  // 1. Не включен или не авторизован
  // 2. Данные уже есть в кеше (не делаем повторный запрос)
  const { data, isLoading, isFetching, error, refetch } = useGetUserPositionsQuery(undefined, {
    skip: !enabled || !isAuthenticated || hasCachedData,
  })

  // Сохраняем данные в Redux после успешной загрузки
  useEffect(() => {
    if (data?.data && data.data.length > 0 && !hasCachedData) {
      dispatch(setPositions(data.data))
    }
  }, [data, dispatch, hasCachedData])

  // Используем данные из кеша или из запроса
  const positionsApi = hasCachedData ? cachedPositions : (data?.data ?? [])
  const mappedPositions = mapEmployeeSubRolesFromApi(positionsApi)

  return {
    positions: mappedPositions,
    positionsApi,
    isLoading: hasCachedData ? false : isLoading,
    isFetching: hasCachedData ? false : isFetching,
    error,
    refetch,
  }
}
