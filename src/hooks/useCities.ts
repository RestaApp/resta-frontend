/**
 * Хук для работы с городами
 * Инкапсулирует логику работы с городами из каталога
 * Использует Redux для кеширования и RTK Query для загрузки
 */

import { useMemo, useEffect } from 'react'
import { useGetCitiesQuery } from '@/services/api/usersApi'
import { useAuth } from '@/contexts/AuthContext'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectCities, setCities } from '@/store/catalogSlice'

interface UseCitiesOptions {
  /**
   * Включить загрузку городов
   */
  enabled?: boolean
}

/**
 * Хук для получения городов
 * Приоритет: данные из Redux > данные из API
 * Запрос выполняется только после успешной авторизации (получения токена)
 * @param options - Опции для управления загрузкой
 */
export const useCities = (options: UseCitiesOptions = {}) => {
  const { enabled = false } = options
  const { isAuthenticated } = useAuth()
  const dispatch = useAppDispatch()
  const citiesFromStore = useAppSelector(selectCities)

  // Пропускаем запрос если:
  // - не включен
  // - не авторизован
  // - города уже есть в Redux
  const shouldSkipQuery = !enabled || !isAuthenticated || citiesFromStore.length > 0

  const { data, isLoading, isFetching, error, refetch } = useGetCitiesQuery(undefined, {
    skip: shouldSkipQuery,
  })

  const citiesFromApi = useMemo(() => data?.data ?? [], [data])

  // Сохраняем города в Redux при загрузке из API
  useEffect(() => {
    if (citiesFromApi.length > 0 && citiesFromStore.length === 0) {
      dispatch(setCities(citiesFromApi))
    }
  }, [citiesFromApi, citiesFromStore.length, dispatch])

  // Используем данные из Redux в первую очередь, если они есть
  // Иначе используем данные из API
  const cities = useMemo(() => {
    if (citiesFromStore.length > 0) {
      return citiesFromStore
    }
    return citiesFromApi
  }, [citiesFromStore, citiesFromApi])

  return {
    cities,
    isLoading: shouldSkipQuery ? false : isLoading,
    isFetching: shouldSkipQuery ? false : isFetching,
    error,
    refetch,
  }
}

