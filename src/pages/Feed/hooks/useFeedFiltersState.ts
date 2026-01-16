/**
 * Хук для управления состоянием фильтров и фида
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectUserPosition } from '@/store/userSlice'
import type { FeedType } from '../types'
import type { AdvancedFiltersData } from '../components/AdvancedFilters'
import type { QuickFilter } from '../utils/clientFilters'
import { createInitialFilters } from '../utils/filterSync'

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
  const [feedType, setFeedType] = useState<FeedType>('jobs')
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Инициализируем фильтры синхронно, если у пользователя есть позиция
  const userPosition = useAppSelector(selectUserPosition)

  // Отдельные фильтры для смен и вакансий
  const [shiftsAdvancedFilters, setShiftsAdvancedFilters] = useState<AdvancedFiltersData | null>(() => 
    createInitialFilters(userPosition)
  )
  const [jobsAdvancedFilters, setJobsAdvancedFilters] = useState<AdvancedFiltersData | null>(() => 
    createInitialFilters(userPosition)
  )

  // Активные фильтры для текущего типа фида (вычисляемое значение)
  const advancedFilters = useMemo(() => {
    return feedType === 'shifts' ? shiftsAdvancedFilters : jobsAdvancedFilters
  }, [feedType, shiftsAdvancedFilters, jobsAdvancedFilters])

  // Сеттер для активных фильтров - обновляет соответствующий набор
  const setAdvancedFilters = useCallback((filters: AdvancedFiltersData | null) => {
    if (feedType === 'shifts') {
      setShiftsAdvancedFilters(filters)
    } else {
      setJobsAdvancedFilters(filters)
    }
  }, [feedType])

  // Обновляем фильтры один раз, когда позиция пользователя стала известна после загрузки
  const initializedPositionRef = useRef(false)
  useEffect(() => {
    // Если уже инициализировали — выходим
    if (initializedPositionRef.current) return

    // Если при инициализации уже есть фильтры с позицией — считаем инициализированным
    if (shiftsAdvancedFilters?.selectedPosition || jobsAdvancedFilters?.selectedPosition) {
      initializedPositionRef.current = true
      return
    }

    // Если позиция загрузилась позже и фильтры пустые — задаём стартовые фильтры один раз
    if (userPosition && !shiftsAdvancedFilters && !jobsAdvancedFilters) {
      setShiftsAdvancedFilters(createInitialFilters(userPosition))
      setJobsAdvancedFilters(createInitialFilters(userPosition))
      initializedPositionRef.current = true
    }
  }, [userPosition, shiftsAdvancedFilters, jobsAdvancedFilters])

  // Синхронизация позиций и специализаций выполняется через утилиту syncFiltersPositionAndSpecializations
  // Это позволяет сохранять отдельные значения для цены и дат между сменами и вакансиями

  const hasAdvancedFilters = useMemo(() => !!advancedFilters, [advancedFilters])

  const resetFilters = useCallback(() => {
    setQuickFilter('all')
    setShiftsAdvancedFilters(null)
    setJobsAdvancedFilters(null)
    setSelectedShiftId(null)
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
