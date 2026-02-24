import { useState, useMemo, useCallback } from 'react'
import { useGetVacanciesQuery } from '@/services/api/shiftsApi'
import type { VacancyApiItem, GetVacanciesParams } from '@/services/api/shiftsApi'
import type { Shift } from '../types'
import type { ShiftType } from '../utils/queryParams'
import { vacancyToShift } from '../utils/mapping'

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
  isRefreshing: boolean
  isFetching: boolean
  error: unknown
  totalCount: number
  loadMore: () => void
  refresh: () => Promise<void>
  reset: () => void
}

export const useVacanciesInfiniteList = (
  options: UseVacanciesInfiniteListOptions
): UseVacanciesInfiniteListReturn => {
  const { shiftType, baseQuery, enabled, perPage = 5 } = options

  const [visibleCount, setVisibleCount] = useState(perPage)

  const queryParams = useMemo<GetVacanciesParams>(() => {
    return {
      ...baseQuery,
      shift_type: shiftType,
      page: 1,
      per_page: visibleCount,
    }
  }, [baseQuery, shiftType, visibleCount])

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetVacanciesQuery(queryParams, {
    refetchOnMountOrArgChange: false,
    skip: !enabled,
  })

  const items = useMemo<Shift[]>(() => {
    const apiItems = response?.data
    if (!apiItems?.length) return []
    return apiItems.map(vacancyToShift)
  }, [response])

  const vacanciesMap = useMemo(() => {
    const apiItems = response?.data
    const map = new Map<number, VacancyApiItem>()
    if (!apiItems?.length) return map
    for (const v of apiItems) map.set(v.id, v)
    return map
  }, [response])

  const totalCount = useMemo(() => {
    const pagination = response?.pagination || response?.meta
    if (!pagination || typeof pagination.total_count !== 'number') {
      // -1 => “ещё не получили итог по текущим параметрам”
      return -1
    }
    return pagination.total_count
  }, [response])

  const hasMore = useMemo(() => {
    const pagination = response?.pagination || response?.meta
    if (!pagination) return false

    if (typeof pagination.total_count === 'number') {
      return items.length < pagination.total_count
    }
    if (pagination.next_page !== undefined && pagination.next_page !== null) return true

    const { current_page, total_pages } = pagination
    if (current_page && total_pages) return current_page < total_pages

    return false
  }, [response, items.length])

  const loadMore = useCallback(() => {
    if (!enabled) return
    if (isLoading || isFetching) return
    if (!hasMore) return
    setVisibleCount(c => c + perPage)
  }, [enabled, hasMore, isLoading, isFetching, perPage])

  const refresh = useCallback(async () => {
    if (!enabled) return
    await refetch()
  }, [enabled, refetch])

  const reset = useCallback(() => {
    setVisibleCount(perPage)
  }, [perPage])

  const isInitialLoading = useMemo(() => {
    if (!enabled) return false
    return items.length === 0 && (isLoading || isFetching || !response)
  }, [enabled, items.length, isLoading, isFetching, response])

  const isRefreshing = useMemo(
    () => enabled && isFetching && items.length > 0,
    [enabled, isFetching, items.length]
  )

  return {
    items,
    vacanciesMap,
    hasMore,
    isInitialLoading,
    isRefreshing,
    isFetching,
    error: isError ? error : null,
    totalCount,
    loadMore,
    refresh,
    reset,
  }
}
