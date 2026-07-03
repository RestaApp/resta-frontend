import { useMemo, useState, useCallback, useEffect } from 'react'
import { useGetVacanciesQuery } from '@/services/api/shiftsApi'
import type { VacancyApiItem, GetVacanciesParams } from '@/services/api/shiftsApi'
import type { PaginationMeta } from '@/shared/api/pagination'
import type { Shift } from '@/shared/shifts/types'
import type { ShiftType } from '../utils/queryParams'
import { vacancyToShift } from '@/shared/shifts/mapping'

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
  refresh: () => Promise<void>
}

export const resolveVacanciesHasMore = (pagination?: PaginationMeta): boolean => {
  if (!pagination) return false
  if (pagination.next_page !== undefined) {
    return pagination.next_page !== null
  }
  if (typeof pagination.current_page === 'number' && typeof pagination.total_pages === 'number') {
    return pagination.current_page < pagination.total_pages
  }
  return false
}

export const useVacanciesInfiniteList = (
  options: UseVacanciesInfiniteListOptions
): UseVacanciesInfiniteListReturn => {
  const { shiftType, baseQuery, enabled, perPage = 5 } = options

  const queryIdentity = useMemo(
    () =>
      JSON.stringify({
        ...baseQuery,
        shift_type: shiftType,
        per_page: perPage,
      }),
    [baseQuery, perPage, shiftType]
  )
  const [paginationState, setPaginationState] = useState(() => ({
    queryIdentity,
    page: 1,
  }))
  const [lastStableData, setLastStableData] = useState<{
    queryIdentity: string
    items: Shift[]
    vacanciesMap: Map<number, VacancyApiItem>
    totalCount: number
    hasMore: boolean
  } | null>(null)
  const page = paginationState.queryIdentity === queryIdentity ? paginationState.page : 1

  const queryParams = useMemo<GetVacanciesParams>(() => {
    return {
      ...baseQuery,
      shift_type: shiftType,
      page,
      per_page: perPage,
    }
  }, [baseQuery, page, perPage, shiftType])

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
      hasMore = resolveVacanciesHasMore(pagination)
    }

    return { items, vacanciesMap: map, totalCount, hasMore, pagination, apiItems }
  }, [response])

  const shouldUseLastStableData = useMemo(() => {
    if (!enabled || !lastStableData || !response) return false
    if (isError) return false
    if (lastStableData.queryIdentity !== queryIdentity) return false

    const hasNoItems = dataSnapshot.items.length === 0
    const hasNoPagination = !dataSnapshot.pagination
    const hasUnknownTotal = dataSnapshot.totalCount === -1

    return hasNoItems && hasNoPagination && hasUnknownTotal
  }, [enabled, isError, lastStableData, queryIdentity, response, dataSnapshot])

  useEffect(() => {
    if (!enabled) return
    if (!response) return
    if (isError) return

    const hasItems = dataSnapshot.items.length > 0
    const explicitEmpty = dataSnapshot.totalCount === 0

    if (hasItems || explicitEmpty) {
      queueMicrotask(() => {
        setLastStableData(prev => {
          if (
            prev &&
            prev.items === dataSnapshot.items &&
            prev.vacanciesMap === dataSnapshot.vacanciesMap &&
            prev.totalCount === dataSnapshot.totalCount &&
            prev.hasMore === dataSnapshot.hasMore
          ) {
            return prev
          }

          return {
            queryIdentity,
            items: dataSnapshot.items,
            vacanciesMap: dataSnapshot.vacanciesMap,
            totalCount: dataSnapshot.totalCount,
            hasMore: dataSnapshot.hasMore,
          }
        })
      })
    }
  }, [dataSnapshot, enabled, isError, queryIdentity, response])

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
    setPaginationState(prev => ({
      queryIdentity,
      page: prev.queryIdentity === queryIdentity ? prev.page + 1 : 2,
    }))
  }, [enabled, hasMore, isFetching, isLoading, queryIdentity])

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLastStableData(null)
    if (page !== 1) {
      setPaginationState({ queryIdentity, page: 1 })
      return
    }
    await refetch()
  }, [enabled, page, queryIdentity, refetch])

  const isInitialLoading = useMemo(() => {
    if (!enabled) return false
    return items.length === 0 && (isLoading || isFetching || !response)
  }, [enabled, items.length, isLoading, isFetching, response])

  return {
    items,
    vacanciesMap,
    hasMore,
    isInitialLoading,
    isFetching,
    error: isError ? error : null,
    totalCount,
    loadMore,
    refresh,
  }
}
