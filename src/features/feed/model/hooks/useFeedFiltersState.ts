/**
 * Хук для управления состоянием фильтров и фида
 */

import { useCallback, useMemo, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectUserCity, selectUserPosition } from '@/features/navigation/model/userSlice'
import type { FeedType } from '../types'
import type { AdvancedFiltersData } from '../../ui/components/AdvancedFilters'
import type { QuickFilter } from '../utils/clientFilters'
import { createInitialFilters } from '../utils/filterSync'
import { getLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'

export interface UseFeedFiltersStateReturn {
  feedType: FeedType
  setFeedType: (type: FeedType) => void
  quickFilter: QuickFilter
  setQuickFilter: (filter: QuickFilter) => void
  advancedFilters: AdvancedFiltersData | null // Активные фильтры для текущего типа (shifts/jobs)
  setAdvancedFilters: (filters: AdvancedFiltersData | null) => void
  shiftsAdvancedFilters: AdvancedFiltersData | null // Фильтры для смен
  jobsAdvancedFilters: AdvancedFiltersData | null // Фильтры для вакансий
  setShiftsAdvancedFilters: (filters: AdvancedFiltersData | null) => void
  setJobsAdvancedFilters: (filters: AdvancedFiltersData | null) => void
  selectedShiftId: number | null
  setSelectedShiftId: (id: number | null) => void
  isFiltersOpen: boolean
  setIsFiltersOpen: (open: boolean) => void
  resetFilters: () => void
  userPosition: string | null | undefined
  hasAdvancedFilters: boolean
}

export const useFeedFiltersState = (): UseFeedFiltersStateReturn => {
  const [feedType, setFeedType] = useState<FeedType>(() => {
    const shouldShowShifts = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS)
    return shouldShowShifts === 'true' ? 'shifts' : 'jobs'
  })
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Инициализируем фильтры синхронно, если у пользователя есть позиция
  const userPosition = useAppSelector(selectUserPosition)
  const userCity = useAppSelector(selectUserCity)

  // Отдельные фильтры для смен и вакансий
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

  const shiftsAdvancedFilters =
    shiftsAdvancedFiltersState === undefined ? derivedInitialFilters : shiftsAdvancedFiltersState
  const jobsAdvancedFilters =
    jobsAdvancedFiltersState === undefined ? derivedInitialFilters : jobsAdvancedFiltersState

  // Активные фильтры для текущего типа фида (вычисляемое значение)
  const advancedFilters = useMemo(() => {
    return feedType === 'shifts' ? shiftsAdvancedFilters : jobsAdvancedFilters
  }, [feedType, shiftsAdvancedFilters, jobsAdvancedFilters])

  // Сеттер для активных фильтров - обновляет соответствующий набор
  const setAdvancedFilters = useCallback(
    (filters: AdvancedFiltersData | null) => {
      if (feedType === 'shifts') {
        setShiftsAdvancedFiltersState(filters)
      } else {
        setJobsAdvancedFiltersState(filters)
      }
    },
    [feedType]
  )

  // Синхронизация позиций и специализаций выполняется через утилиту syncFiltersPositionAndSpecializations
  // Это позволяет сохранять отдельные значения для цены и дат между сменами и вакансиями

  const hasAdvancedFilters = useMemo(() => !!advancedFilters, [advancedFilters])

  const resetFilters = useCallback(() => {
    setQuickFilter('all')
    setShiftsAdvancedFiltersState(null)
    setJobsAdvancedFiltersState(null)
    setSelectedShiftId(null)
  }, [])

  const setShiftsAdvancedFilters = useCallback((filters: AdvancedFiltersData | null) => {
    setShiftsAdvancedFiltersState(filters)
  }, [])

  const setJobsAdvancedFilters = useCallback((filters: AdvancedFiltersData | null) => {
    setJobsAdvancedFiltersState(filters)
  }, [])

  return {
    feedType,
    setFeedType,
    quickFilter,
    setQuickFilter,
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
    userPosition,
    hasAdvancedFilters,
  }
}
