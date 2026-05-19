/**
 * Хук для управления состоянием фильтров и фида
 */

import { useCallback, useMemo, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectUserCity, selectUserPosition } from '@/features/navigation/model/userSlice'
import type { AdvancedFiltersData, FeedType } from '../types'
import { hasActiveFilters, normalizeAdvancedFilters } from '@/utils/filters'
import { createInitialFilters } from '../utils/filterSync'
import { loadFeedFilterTemplate, saveFeedFilterTemplate } from '../utils/feedFilterTemplates'

export interface UseFeedFiltersStateReturn {
  feedType: FeedType
  setFeedType: (type: FeedType) => void
  advancedFilters: AdvancedFiltersData | null
  setAdvancedFilters: (filters: AdvancedFiltersData | null) => void
  shiftsAdvancedFilters: AdvancedFiltersData | null
  jobsAdvancedFilters: AdvancedFiltersData | null
  setShiftsAdvancedFilters: (filters: AdvancedFiltersData | null) => void
  setJobsAdvancedFilters: (filters: AdvancedFiltersData | null) => void
  selectedShiftId: number | null
  setSelectedShiftId: (id: number | null) => void
  isFiltersOpen: boolean
  setIsFiltersOpen: (open: boolean) => void
  resetFilters: () => void
}

const resolveStoredFilters = (
  saved: AdvancedFiltersData | null,
  derivedInitial: AdvancedFiltersData | null
): AdvancedFiltersData | null => {
  if (saved && hasActiveFilters(saved)) return normalizeAdvancedFilters(saved)
  return derivedInitial
}

export const useFeedFiltersState = (): UseFeedFiltersStateReturn => {
  const [feedType, setFeedType] = useState<FeedType>('jobs')
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const userPosition = useAppSelector(selectUserPosition)
  const userCity = useAppSelector(selectUserCity)

  const derivedInitialFilters = useMemo(
    () => createInitialFilters(userPosition, userCity),
    [userPosition, userCity]
  )
  const [shiftsAdvancedFiltersState, setShiftsAdvancedFiltersState] = useState<
    AdvancedFiltersData | null | undefined
  >(undefined)
  const [jobsAdvancedFiltersState, setJobsAdvancedFiltersState] = useState<
    AdvancedFiltersData | null | undefined
  >(undefined)

  const shiftsAdvancedFilters = useMemo(() => {
    if (shiftsAdvancedFiltersState !== undefined) return shiftsAdvancedFiltersState
    return resolveStoredFilters(loadFeedFilterTemplate('shifts'), derivedInitialFilters)
  }, [shiftsAdvancedFiltersState, derivedInitialFilters])

  const jobsAdvancedFilters = useMemo(() => {
    if (jobsAdvancedFiltersState !== undefined) return jobsAdvancedFiltersState
    return resolveStoredFilters(loadFeedFilterTemplate('jobs'), derivedInitialFilters)
  }, [jobsAdvancedFiltersState, derivedInitialFilters])

  const advancedFilters = useMemo(() => {
    return feedType === 'shifts' ? shiftsAdvancedFilters : jobsAdvancedFilters
  }, [feedType, shiftsAdvancedFilters, jobsAdvancedFilters])

  const setAdvancedFilters = useCallback(
    (filters: AdvancedFiltersData | null) => {
      const normalized = normalizeAdvancedFilters(filters)
      if (feedType === 'shifts') {
        setShiftsAdvancedFiltersState(normalized)
        saveFeedFilterTemplate('shifts', normalized)
      } else {
        setJobsAdvancedFiltersState(normalized)
        saveFeedFilterTemplate('jobs', normalized)
      }
    },
    [feedType]
  )

  const resetFilters = useCallback(() => {
    setShiftsAdvancedFiltersState(null)
    setJobsAdvancedFiltersState(null)
    saveFeedFilterTemplate('shifts', null)
    saveFeedFilterTemplate('jobs', null)
    setSelectedShiftId(null)
  }, [])

  const setShiftsAdvancedFilters = useCallback((filters: AdvancedFiltersData | null) => {
    const normalized = normalizeAdvancedFilters(filters)
    setShiftsAdvancedFiltersState(normalized)
    saveFeedFilterTemplate('shifts', normalized)
  }, [])

  const setJobsAdvancedFilters = useCallback((filters: AdvancedFiltersData | null) => {
    const normalized = normalizeAdvancedFilters(filters)
    setJobsAdvancedFiltersState(normalized)
    saveFeedFilterTemplate('jobs', normalized)
  }, [])

  return {
    feedType,
    setFeedType,
    advancedFilters,
    setAdvancedFilters,
    shiftsAdvancedFilters,
    jobsAdvancedFilters,
    setShiftsAdvancedFilters,
    setJobsAdvancedFilters,
    selectedShiftId,
    setSelectedShiftId,
    isFiltersOpen,
    setIsFiltersOpen,
    resetFilters,
  }
}
