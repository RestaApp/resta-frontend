import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useGetVacanciesQuery } from '@/services/api/shiftsApi'
import type { VacancyApiItem, GetVacanciesParams } from '@/services/api/shiftsApi'
import type { Shift } from '../types'
import type { ShiftType } from '../utils/queryParams'
import { stableSerialize } from '../utils/stableSerialize'
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
  reset: () => void
  addVacanciesToMap: (vacancies: VacancyApiItem[]) => void
}

export const useVacanciesInfiniteList = (options: UseVacanciesInfiniteListOptions): UseVacanciesInfiniteListReturn => {
  const { shiftType, baseQuery, enabled, perPage = 5 } = options

  const [page, setPage] = useState(1)
  const [items, setItems] = useState<Shift[]>([])
  const [vacanciesMap, setVacanciesMap] = useState<Map<number, VacancyApiItem>>(new Map())

  // ключ параметров без page/perPage — чтобы корректно понять смену фильтра
  const baseKey = useMemo(() => stableSerialize({ shiftType, baseQuery }), [shiftType, baseQuery])
  const prevBaseKeyRef = useRef<string | null>(null)

  // флаг: ждём новую страницу 1 по новым параметрам (не чистим сразу UI)
  const [pendingReplace, setPendingReplace] = useState(false)

  useEffect(() => {
    if (!enabled) return
    if (prevBaseKeyRef.current === null) {
      prevBaseKeyRef.current = baseKey
      return
    }
    if (prevBaseKeyRef.current !== baseKey) {
      prevBaseKeyRef.current = baseKey
      setPage(1)
      setPendingReplace(true)
    }
  }, [baseKey, enabled])

  const queryParams = useMemo<GetVacanciesParams>(() => {
    return {
      ...baseQuery,
      shift_type: shiftType,
      page,
      per_page: perPage,
    }
  }, [baseQuery, shiftType, page, perPage])

  const { data: response, isLoading, isFetching, isError, error } = useGetVacanciesQuery(queryParams, {
    refetchOnMountOrArgChange: false,
    skip: !enabled,
  })

  useEffect(() => {
    if (!enabled) return
    if (!response) return

    const pagination = response.pagination || response.meta
    const responsePage = pagination?.current_page ?? page

    const apiItems = Array.isArray(response.data) ? response.data : []
    const mapped = apiItems.map(vacancyToShift)

    // page 1: заменяем (если пришёл ответ)
    if (responsePage === 1) {
      setItems(mapped)
      const newMap = new Map<number, VacancyApiItem>()
      for (const v of apiItems) newMap.set(v.id, v)
      setVacanciesMap(newMap)
      setPendingReplace(false)
      return
    }

    // page > 1: дополняем уникальными
    if (mapped.length) {
      setItems(prev => {
        const existing = new Set(prev.map(x => x.id))
        const next = mapped.filter(x => !existing.has(x.id))
        return next.length ? [...prev, ...next] : prev
      })
      setVacanciesMap(prev => {
        const next = new Map(prev)
        for (const v of apiItems) if (!next.has(v.id)) next.set(v.id, v)
        return next
      })
    }
  }, [enabled, response, page])

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
    setPage(p => p + 1)
  }, [enabled, hasMore, isLoading, isFetching])

  const reset = useCallback(() => {
    setPage(1)
    setItems([])
    setVacanciesMap(new Map())
    setPendingReplace(false)
    prevBaseKeyRef.current = null
  }, [])

  const addVacanciesToMap = useCallback((vacancies: VacancyApiItem[]) => {
    setVacanciesMap(prev => {
      const next = new Map(prev)
      for (const v of vacancies) if (!next.has(v.id)) next.set(v.id, v)
      return next
    })
  }, [])

  const isInitialLoading = useMemo(() => {
    if (!enabled) return false
    // обычная первая загрузка
    return page === 1 && items.length === 0 && (isLoading || isFetching || !response)
  }, [enabled, page, items.length, isLoading, isFetching, response])

  const isRefreshing = useMemo(() => pendingReplace && isFetching, [pendingReplace, isFetching])

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
    reset,
    addVacanciesToMap,
  }
}
