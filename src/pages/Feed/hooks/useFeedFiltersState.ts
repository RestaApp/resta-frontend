/**
 * Хук для управления состоянием фильтров и фида
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { DEFAULT_PRICE_RANGE } from '@/utils/filters'
import type { FeedType } from '../types'
import type { AdvancedFiltersData } from '../components/AdvancedFilters'
import type { QuickFilter } from '../utils/clientFilters'

export interface UseFeedFiltersStateReturn {
  feedType: FeedType
  setFeedType: (type: FeedType) => void
  quickFilter: QuickFilter
  setQuickFilter: (filter: QuickFilter) => void
  advancedFilters: AdvancedFiltersData | null
  setAdvancedFilters: (filters: AdvancedFiltersData | null) => void
  selectedShiftId: number | null
  setSelectedShiftId: (id: number | null) => void
  isFiltersOpen: boolean
  setIsFiltersOpen: (open: boolean) => void
  resetFilters: () => void
  userPosition: string | null | undefined
  hasAdvancedFilters: boolean
}

export const useFeedFiltersState = (): UseFeedFiltersStateReturn => {
  const [feedType, setFeedType] = useState<FeedType>('shifts')
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Инициализируем фильтры синхронно, если у пользователя есть позиция
  const userData = useAppSelector(state => state.user.userData)
  const userPosition = userData?.position || userData?.employee_profile?.position

  // Lazy initialization для фильтров - вычисляется только один раз при первом рендере
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersData | null>(() => {
    const position = userData?.position || userData?.employee_profile?.position
    if (position) {
      return {
        priceRange: DEFAULT_PRICE_RANGE,
        selectedPosition: position,
        selectedSpecializations: [],
        startDate: null,
        endDate: null,
      }
    }
    return null
  })

  // Обновляем фильтры один раз, когда позиция пользователя стала известна после загрузки
  // Не переустанавливаем после ручного сброса (иначе position будет возвращаться)
  const initializedPositionRef = useRef(false)
  useEffect(() => {
    // Если уже инициализировали — выходим
    if (initializedPositionRef.current) return

    // Если при инициализации уже есть advancedFilters с позицией — считаем инициализированным
    if (advancedFilters?.selectedPosition) {
      initializedPositionRef.current = true
      return
    }

    // Если позиция загрузилась позже и фильтры пустые — задаём стартовые фильтры один раз
    if (userPosition && !advancedFilters) {
      setAdvancedFilters({
        priceRange: DEFAULT_PRICE_RANGE,
        selectedPosition: userPosition,
        selectedSpecializations: [],
        startDate: null,
        endDate: null,
      })
      initializedPositionRef.current = true
    }
  }, [userPosition, advancedFilters])

  const hasAdvancedFilters = useMemo(() => !!advancedFilters, [advancedFilters])

  const resetFilters = () => {
    setQuickFilter('all')
    setAdvancedFilters(null)
    setSelectedShiftId(null)
  }

  return {
    feedType,
    setFeedType,
    quickFilter,
    setQuickFilter,
    advancedFilters,
    setAdvancedFilters,
    selectedShiftId,
    setSelectedShiftId,
    isFiltersOpen,
    setIsFiltersOpen,
    resetFilters,
    userPosition,
    hasAdvancedFilters,
  }
}
