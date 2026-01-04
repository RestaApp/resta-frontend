/**
 * Хук для работы со специализациями
 * Инкапсулирует логику работы со специализациями пользователей
 * Использует Redux как кеш для избежания повторных запросов
 */

import { useEffect, useMemo, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useGetUserSpecializationsQuery } from '@/services/api/usersApi'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setSpecializations, selectSpecializationsByPosition } from '@/store/catalogSlice'

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
  const normalizedPosition = useMemo(() => (position || '').toLowerCase(), [position])
  
  // КРИТИЧНО: Отслеживаем позицию, для которой был сделан запрос
  // Это предотвращает сохранение данных от предыдущего запроса под неправильным ключом
  const requestPositionRef = useRef<string>('')
  
  // Получаем специализации из Redux кеша для данной позиции
  const cachedSpecializations = useAppSelector((state) =>
    selectSpecializationsByPosition(state, normalizedPosition)
  )
  
  // Проверяем наличие данных в кеше для текущей позиции
  const hasCachedData = normalizedPosition ? cachedSpecializations.length > 0 : false

  // Пропускаем запрос если:
  // 1. Не включен или не авторизован или нет позиции
  // 2. Данные уже есть в Redux кеше для этой позиции (не делаем повторный запрос)
  const shouldSkipQuery = !enabled || !isAuthenticated || !normalizedPosition || hasCachedData
  
  // КРИТИЧНО: Очищаем ref при смене позиции, чтобы предотвратить использование данных от предыдущего запроса
  useEffect(() => {
    // Если позиция изменилась, очищаем ref (данные от предыдущего запроса не должны использоваться)
    if (requestPositionRef.current && requestPositionRef.current !== normalizedPosition) {
      requestPositionRef.current = ''
    }
  }, [normalizedPosition])
  
  // Выполняем запрос к API
  const { data: _prevData, currentData, isLoading, isFetching, error, refetch } = useGetUserSpecializationsQuery(
    normalizedPosition,
    {
      skip: shouldSkipQuery,
      // Принудительно обновляем при изменении позиции
      refetchOnMountOrArgChange: true,
    }
  )

  // КРИТИЧНО: Обновляем ref ТОЛЬКО когда запрос действительно выполняется
  // Это гарантирует, что мы отслеживаем позицию, для которой был сделан запрос
  useEffect(() => {
    if (!shouldSkipQuery && normalizedPosition) {
      // Запрос будет выполнен для этой позиции
      requestPositionRef.current = normalizedPosition
    }
  }, [shouldSkipQuery, normalizedPosition])

  // Сохраняем данные в Redux после успешной загрузки
  // КРИТИЧНО: сохраняем данные ТОЛЬКО если они соответствуют позиции, для которой был сделан запрос
  useEffect(() => {
    // Проверяем все условия:
    // 1. Есть данные от API
    // 2. Есть текущая позиция
    // 3. Нет данных в кеше для этой позиции
    // 4. Данные соответствуют позиции, для которой был сделан запрос (защита от race condition)
    if (
      currentData?.data &&
      currentData.data.length > 0 &&
      normalizedPosition && 
      !hasCachedData &&
      requestPositionRef.current === normalizedPosition // КРИТИЧНО: данные точно для текущей позиции
    ) {
      // Сохраняем данные с явным указанием позиции
      dispatch(setSpecializations({ 
        position: normalizedPosition, 
        specializations: currentData.data 
      }))
    }
  }, [currentData, normalizedPosition, dispatch, hasCachedData])

  // Используем данные из кеша или из запроса
  // КРИТИЧНО: используем данные из запроса только если они соответствуют текущей позиции
  const specializations = useMemo(() => {
    if (!normalizedPosition) return []
    
    // Приоритет 1: данные из Redux кеша (если есть)
    if (hasCachedData && cachedSpecializations.length > 0) {
      return cachedSpecializations
    }
    
    // Приоритет 2: данные из запроса (если есть)
    // КРИТИЧНО: используем данные только если они соответствуют текущей позиции
    // Это защита от использования данных от предыдущего запроса
    if (
      currentData?.data &&
      currentData.data.length > 0 &&
      requestPositionRef.current === normalizedPosition
    ) {
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
