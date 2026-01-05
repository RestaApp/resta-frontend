/**
 * Хук для бесконечной загрузки вакансий с пагинацией
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useGetVacanciesQuery } from '@/services/api/shiftsApi'
import type { VacancyApiItem, GetVacanciesParams } from '@/services/api/shiftsApi'
import type { Shift } from '../types'
import { mapVacancyToShift } from '../utils/mapping'
import type { ShiftType } from '../utils/queryParams'

export interface UseVacanciesInfiniteListOptions {
  shiftType: ShiftType
  baseQuery: Omit<GetVacanciesParams, 'page' | 'per_page' | 'shift_type'>
  enabled: boolean
  perPage?: number
}

export interface UseVacanciesInfiniteListReturn {
  items: Shift[]
  vacanciesMap: Map<number, VacancyApiItem>
  hasMore: boolean
  isInitialLoading: boolean
  isFetching: boolean
  error: unknown
  totalCount: number
  loadMore: () => void
  reset: () => void
  addVacanciesToMap: (vacancies: VacancyApiItem[]) => void
}

/**
 * Хук для бесконечной загрузки вакансий с пагинацией
 */
export const useVacanciesInfiniteList = (
  options: UseVacanciesInfiniteListOptions
): UseVacanciesInfiniteListReturn => {
  const { shiftType, baseQuery, enabled, perPage = 5 } = options

  const [currentPage, setCurrentPage] = useState(1)
  const [items, setItems] = useState<Shift[]>([])
  const [vacanciesMap, setVacanciesMap] = useState<Map<number, VacancyApiItem>>(new Map())
  
  // Отслеживаем предыдущие параметры для определения изменений
  const prevParamsRef = useRef<{ baseQuery: typeof baseQuery; shiftType: typeof shiftType } | null>(null)

  // Формируем параметры запроса с пагинацией
  const queryParams = useMemo<GetVacanciesParams>(
    () => ({
      ...baseQuery,
      shift_type: shiftType,
      page: currentPage,
      per_page: perPage,
    }),
    [baseQuery, shiftType, currentPage, perPage]
  )

  // Запрос данных
  const { data: response, isLoading, isFetching, isError, error } = useGetVacanciesQuery(queryParams, {
    refetchOnMountOrArgChange: false,
    skip: !enabled,
  })

  // Обработка данных
  useEffect(() => {
    // Пропускаем обработку, если запрос отключен или идет первичная загрузка
    if (!enabled) {
      return
    }

    // Если нет данных и идет загрузка - не обрабатываем (ждем данные)
    if (!response && (isLoading || isFetching)) {
      return
    }

    // Если нет данных и загрузка не идет - это может быть ошибка или пустой ответ
    // Не очищаем существующие данные, чтобы не потерять их при refetch
    if (!response) {
      return
    }

    // Обрабатываем данные, даже если идет refetch (isFetching === true)
    // Это важно для предотвращения потери данных при обновлении
    const pagination = response.pagination || response.meta
    const responsePage = pagination?.current_page || currentPage
    const apiItems = Array.isArray(response.data) ? response.data : []
    const newItems = apiItems.map(mapVacancyToShift)

    // Для первой страницы всегда заменяем данные
    if (responsePage === 1) {
      if (newItems.length > 0) {
        setItems(newItems)
        const newMap = new Map<number, VacancyApiItem>()
        apiItems.forEach(vacancy => {
          newMap.set(vacancy.id, vacancy)
        })
        setVacanciesMap(newMap)
      } else {
        // Пустой ответ - очищаем данные только если это не refetch
        // При refetch сохраняем существующие данные, если новых нет
        if (!isFetching) {
          setItems([])
          setVacanciesMap(new Map())
        }
      }
      return
    }

    // Последующие загрузки - добавляем к существующим
    if (newItems.length > 0) {
      setItems(prev => {
        const existingIds = new Set(prev.map(s => s.id))
        const uniqueNewItems = newItems.filter(s => !existingIds.has(s.id))
        return uniqueNewItems.length > 0 ? [...prev, ...uniqueNewItems] : prev
      })
      setVacanciesMap(prev => {
        const newMap = new Map(prev)
        apiItems.forEach(vacancy => {
          if (!newMap.has(vacancy.id)) {
            newMap.set(vacancy.id, vacancy)
          }
        })
        return newMap
      })
    }
  }, [response, isLoading, currentPage, enabled, isFetching])

  // Проверяем, есть ли еще данные для загрузки
  const hasMore = useMemo(() => {
    const pagination = response?.pagination || response?.meta
    if (!pagination) return false

    // Проверяем по total_count
    const totalCount = pagination.total_count
    if (totalCount !== undefined && totalCount !== null) {
      return items.length < totalCount
    }

    // Fallback: проверяем через next_page
    if (pagination.next_page !== undefined && pagination.next_page !== null) {
      return true
    }

    const { current_page, total_pages } = pagination
    if (current_page && total_pages) {
      return current_page < total_pages
    }

    return false
  }, [response, items.length])

  // Сброс при изменении базовых параметров
  useEffect(() => {
    const prevParams = prevParamsRef.current
    const hasParamsChanged = 
      !prevParams ||
      prevParams.shiftType !== shiftType ||
      JSON.stringify(prevParams.baseQuery) !== JSON.stringify(baseQuery)
    
    if (hasParamsChanged) {
      setCurrentPage(1)
      // Очищаем данные только если параметры действительно изменились
      // Это предотвратит потерю данных при случайных ре-рендерах
      if (prevParams !== null) {
        setItems([])
        setVacanciesMap(new Map())
      }
      prevParamsRef.current = { baseQuery, shiftType }
    }
  }, [baseQuery, shiftType])

  const loadMore = useCallback(() => {
    if (!isLoading && !isFetching && hasMore) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasMore, isLoading, isFetching])

  const reset = useCallback(() => {
    setCurrentPage(1)
    setItems([])
    setVacanciesMap(new Map())
  }, [])

  const addVacanciesToMap = useCallback((vacancies: VacancyApiItem[]) => {
    setVacanciesMap(prev => {
      const newMap = new Map(prev)
      vacancies.forEach(vacancy => {
        if (!newMap.has(vacancy.id)) {
          newMap.set(vacancy.id, vacancy)
        }
      })
      return newMap
    })
  }, [])

  const totalCount = useMemo(() => {
    const pagination = response?.pagination || response?.meta
    return pagination?.total_count ?? 0
  }, [response])

  return {
    items,
    vacanciesMap,
    hasMore,
    isInitialLoading: enabled && currentPage === 1 && items.length === 0 && (isLoading || isFetching),
    isFetching,
    error: isError ? error : null,
    totalCount,
    loadMore,
    reset,
    addVacanciesToMap,
  }
}
