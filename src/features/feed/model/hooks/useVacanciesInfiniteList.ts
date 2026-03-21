import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
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
  const lastStableDataRef = useRef<{
    items: Shift[]
    vacanciesMap: Map<number, VacancyApiItem>
    totalCount: number
    hasMore: boolean
  } | null>(null)

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

  const dataSnapshot = useMemo(() => {
    const apiItems = response?.data
    const items = apiItems?.length ? apiItems.map(vacancyToShift) : []
    const map = new Map<number, VacancyApiItem>()
    if (apiItems?.length) {
      for (const v of apiItems) map.set(v.id, v)
    }
    const pagination = response?.pagination || response?.meta
    let totalCount = -1
    if (!pagination || typeof pagination.total_count !== 'number') {
      totalCount = -1
    } else {
      totalCount = pagination.total_count
    }

    let hasMore = false
    if (pagination) {
      if (typeof pagination.total_count === 'number') {
        hasMore = items.length < pagination.total_count
      } else if (pagination.next_page !== undefined && pagination.next_page !== null) {
        hasMore = true
      } else {
        const { current_page, total_pages } = pagination
        if (current_page && total_pages) hasMore = current_page < total_pages
      }
    }

    return { items, vacanciesMap: map, totalCount, hasMore, pagination, apiItems }
  }, [response])

  const lastStableData = lastStableDataRef.current

  const shouldUseLastStableData = useMemo(() => {
    if (!enabled || !lastStableData || !response) return false
    if (isError) return false

    const hasNoItems = dataSnapshot.items.length === 0
    const hasNoPagination = !dataSnapshot.pagination
    const hasUnknownTotal = dataSnapshot.totalCount === -1

    return hasNoItems && hasNoPagination && hasUnknownTotal
  }, [enabled, isError, lastStableData, response, dataSnapshot])

  useEffect(() => {
    if (!enabled) return
    if (!response) return
    if (isError) return

    const hasItems = dataSnapshot.items.length > 0
    const explicitEmpty = dataSnapshot.totalCount === 0

    if (hasItems || explicitEmpty) {
      lastStableDataRef.current = {
        items: dataSnapshot.items,
        vacanciesMap: dataSnapshot.vacanciesMap,
        totalCount: dataSnapshot.totalCount,
        hasMore: dataSnapshot.hasMore,
      }
    }
  }, [enabled, isError, response, dataSnapshot])

  const items = shouldUseLastStableData ? (lastStableData?.items ?? []) : dataSnapshot.items
  const vacanciesMap = shouldUseLastStableData
    ? (lastStableData?.vacanciesMap ?? new Map<number, VacancyApiItem>())
    : dataSnapshot.vacanciesMap
  const totalCount = shouldUseLastStableData
    ? (lastStableData?.totalCount ?? -1)
    : dataSnapshot.totalCount
  const hasMore = shouldUseLastStableData
    ? (lastStableData?.hasMore ?? false)
    : dataSnapshot.hasMore

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
