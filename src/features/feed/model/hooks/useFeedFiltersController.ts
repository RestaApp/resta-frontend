import { useCallback, useEffect, useMemo } from 'react'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'
import {
  formatFiltersForDisplay,
  hasActiveFilters,
  normalizeAdvancedFilters,
  removeAdvancedFilter,
} from '@/shared/utils/filters'
import { syncFiltersPositionAndSpecializations } from '../utils/filterSync'
import type { AdvancedFiltersData } from '@/shared/shifts/types'

interface UseFeedFiltersControllerParams {
  feedType: 'jobs' | 'shifts'
  advancedFilters: AdvancedFiltersData | null
  setAdvancedFilters: (value: AdvancedFiltersData | null) => void
  shiftsAdvancedFilters: AdvancedFiltersData | null
  jobsAdvancedFilters: AdvancedFiltersData | null
  setShiftsAdvancedFilters: (value: AdvancedFiltersData | null) => void
  setJobsAdvancedFilters: (value: AdvancedFiltersData | null) => void
  setIsFiltersOpen: (value: boolean) => void
}

export const useFeedFiltersController = ({
  feedType,
  advancedFilters,
  setAdvancedFilters,
  shiftsAdvancedFilters,
  jobsAdvancedFilters,
  setShiftsAdvancedFilters,
  setJobsAdvancedFilters,
  setIsFiltersOpen,
}: UseFeedFiltersControllerParams) => {
  const closeFilters = useCallback(() => setIsFiltersOpen(false), [setIsFiltersOpen])

  useEffect(() => {
    return onAppEvent(APP_EVENTS.OPEN_FEED_FILTERS, () => setIsFiltersOpen(true))
  }, [setIsFiltersOpen])

  const applyAdvancedFilters = useCallback(
    (filters: AdvancedFiltersData | null) => {
      const normalized = normalizeAdvancedFilters(filters)
      setAdvancedFilters(normalized)
      if (!normalized) return

      if (feedType === 'shifts') {
        setJobsAdvancedFilters(
          syncFiltersPositionAndSpecializations(normalized, jobsAdvancedFilters)
        )
        return
      }

      setShiftsAdvancedFilters(
        syncFiltersPositionAndSpecializations(normalized, shiftsAdvancedFilters)
      )
    },
    [
      feedType,
      jobsAdvancedFilters,
      setAdvancedFilters,
      setJobsAdvancedFilters,
      setShiftsAdvancedFilters,
      shiftsAdvancedFilters,
    ]
  )

  const hasActiveFiltersFlag = useMemo(() => hasActiveFilters(advancedFilters), [advancedFilters])
  const activeFilters = useMemo(() => formatFiltersForDisplay(advancedFilters), [advancedFilters])

  const removeFilter = useCallback(
    (filterId: string) => {
      if (!advancedFilters) return
      applyAdvancedFilters(removeAdvancedFilter(advancedFilters, filterId))
    },
    [advancedFilters, applyAdvancedFilters]
  )

  return {
    hasActiveFilters: hasActiveFiltersFlag,
    activeFilters,
    closeFilters,
    applyAdvancedFilters,
    removeFilter,
  }
}
