import { useCallback, useEffect, useRef, useState } from 'react'
import { onAppEvent, type AppEventName } from '@/shared/utils/appEvents'
import { resolveResetFilters } from './usePaginatedFilterState.utils'

export interface PaginationMeta {
  total_count?: number
  next_page?: number | null
  current_page?: number
  total_pages?: number
}

export const computeHasMore = (
  pagination: PaginationMeta | undefined,
  loadedCount: number
): boolean => {
  if (!pagination) return false
  if (typeof pagination.total_count === 'number') {
    return loadedCount < pagination.total_count
  }
  if (pagination.next_page !== undefined && pagination.next_page !== null) return true
  if (pagination.current_page && pagination.total_pages) {
    return pagination.current_page < pagination.total_pages
  }
  return false
}

interface UsePaginatedFilterStateOptions<TFilters> {
  defaultFilters: TFilters
  pageSize: number
  removeFilter: (filters: TFilters, filterId: string) => TFilters
  createResetFilters?: (defaultFilters: TFilters) => TFilters
  openAppEvent?: AppEventName
  openFiltersOnAppEvent?: boolean
  onOpenAppEvent?: () => void
}

export const usePaginatedFilterState = <TFilters>({
  defaultFilters,
  pageSize,
  removeFilter,
  createResetFilters,
  openAppEvent,
  openFiltersOnAppEvent = false,
  onOpenAppEvent,
}: UsePaginatedFilterStateOptions<TFilters>) => {
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [draftFilters, setDraftFilters] = useState(defaultFilters)
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const appliedFiltersRef = useRef(appliedFilters)
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters
  }, [appliedFilters])

  useEffect(() => {
    if (!openAppEvent) return
    return onAppEvent(openAppEvent, () => {
      setDraftFilters(appliedFiltersRef.current)
      if (openFiltersOnAppEvent) setIsFiltersOpen(true)
      onOpenAppEvent?.()
    })
  }, [onOpenAppEvent, openAppEvent, openFiltersOnAppEvent])

  const resetVisibleCount = useCallback(() => {
    setVisibleCount(pageSize)
  }, [pageSize])

  const incrementVisibleCount = useCallback(() => {
    setVisibleCount(prev => prev + pageSize)
  }, [pageSize])

  const handleResetFilters = useCallback(() => {
    const next = resolveResetFilters(defaultFilters, createResetFilters)
    setAppliedFilters(next)
    setDraftFilters(next)
    resetVisibleCount()
  }, [createResetFilters, defaultFilters, resetVisibleCount])

  const handleRemoveFilter = useCallback(
    (filterId: string) => {
      const next = removeFilter(appliedFilters, filterId)
      setAppliedFilters(next)
      setDraftFilters(next)
      resetVisibleCount()
    },
    [appliedFilters, removeFilter, resetVisibleCount]
  )

  const handleResetDraftFilters = useCallback(() => {
    setDraftFilters(resolveResetFilters(defaultFilters, createResetFilters))
  }, [createResetFilters, defaultFilters])

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters)
    resetVisibleCount()
    setIsFiltersOpen(false)
  }, [draftFilters, resetVisibleCount])

  const handleOpenFilters = useCallback(() => {
    setDraftFilters(appliedFilters)
    setIsFiltersOpen(true)
  }, [appliedFilters])

  return {
    appliedFilters,
    setAppliedFilters,
    draftFilters,
    setDraftFilters,
    visibleCount,
    isFiltersOpen,
    setIsFiltersOpen,
    appliedFiltersRef,
    resetVisibleCount,
    incrementVisibleCount,
    handleResetFilters,
    handleRemoveFilter,
    handleResetDraftFilters,
    handleApplyFilters,
    handleOpenFilters,
  }
}
