import { useCallback, useState } from 'react'
import { useUserPositions } from '@/features/navigation/model/hooks/useUserPositions'
import { useUserSpecializations } from '@/features/navigation/model/hooks/useUserSpecializations'
import { DEFAULT_PRICE_RANGE, DEFAULT_JOBS_PRICE_RANGE } from '@/utils/filters'
import { parseMoneyInput } from '../utils/formatting'
import { useAdvancedFilters } from './useAdvancedFilters'
import type { AdvancedFiltersData } from '../../ui/components/AdvancedFilters'

interface UseAdvancedFiltersSheetParams {
  initialFilters: AdvancedFiltersData | null
  onApply: (filters: AdvancedFiltersData | null) => void
  isVacancy: boolean
  filteredCount: number | undefined
}

const formatLocalDateKey = (date: Date): string => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const todayKey = (): string => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return formatLocalDateKey(today)
}

/**
 * Контроллер `AdvancedFiltersSheet`.
 *
 * SRP: оборачивает базовый `useAdvancedFilters` и добавляет UI-специфическое
 * состояние: clamp range, кеш предыдущих специализаций, date helpers,
 * production-обработчики input‑полей. Любая бизнес‑логика (применение фильтров)
 * остаётся в `useAdvancedFilters`.
 */
export const useAdvancedFiltersSheet = ({
  initialFilters,
  onApply,
  isVacancy,
  filteredCount,
}: UseAdvancedFiltersSheetParams) => {
  const filters = useAdvancedFilters({ initialFilters, onApply })
  const { priceRange, setPriceRange, selectedPosition, handlePositionSelect } = filters

  const maxRateLimit = isVacancy ? 5000 : 1000
  const displayPriceRange =
    priceRange ?? (isVacancy ? DEFAULT_JOBS_PRICE_RANGE : DEFAULT_PRICE_RANGE)

  const clampPriceRange = useCallback(
    (lo: number, hi: number): [number, number] => {
      let a = Math.min(Math.max(0, Math.round(lo)), maxRateLimit)
      let b = Math.min(Math.max(0, Math.round(hi)), maxRateLimit)
      if (a > b) [a, b] = [b, a]
      return [a, b]
    },
    [maxRateLimit]
  )

  const handleRangeChange = useCallback(
    (range: [number, number]) => setPriceRange(clampPriceRange(range[0], range[1])),
    [setPriceRange, clampPriceRange]
  )

  const handleMinInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (!raw.trim()) {
        handleRangeChange(clampPriceRange(0, displayPriceRange[1]))
        return
      }
      const parsed = parseMoneyInput(raw)
      if (parsed === null) return
      handleRangeChange(clampPriceRange(parsed, displayPriceRange[1]))
    },
    [clampPriceRange, displayPriceRange, handleRangeChange]
  )

  const handleMaxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (!raw.trim()) {
        handleRangeChange(clampPriceRange(displayPriceRange[0], 0))
        return
      }
      const parsed = parseMoneyInput(raw)
      if (parsed === null) return
      handleRangeChange(clampPriceRange(displayPriceRange[0], parsed))
    },
    [clampPriceRange, displayPriceRange, handleRangeChange]
  )

  const [previousSpecializations, setPreviousSpecializations] = useState<string[]>([])

  const { positions } = useUserPositions({ enabled: true })
  const {
    specializations: availableSpecializations,
    isLoading: isLoadingSpecializations,
    isFetching: isFetchingSpecializations,
  } = useUserSpecializations({
    position: selectedPosition,
    enabled: !!selectedPosition,
  })

  const handlePositionClick = useCallback(
    (positionValue: string) => {
      const isChanging = selectedPosition !== positionValue
      if (isChanging && availableSpecializations.length > 0) {
        setPreviousSpecializations(availableSpecializations)
      }
      if (!isChanging) {
        setPreviousSpecializations([])
      }
      handlePositionSelect(positionValue)
    },
    [availableSpecializations, handlePositionSelect, selectedPosition]
  )

  const isLoading = isLoadingSpecializations || isFetchingSpecializations
  const shouldShowPrevious = isLoading && previousSpecializations.length > 0
  const displaySpecializations = shouldShowPrevious
    ? previousSpecializations
    : availableSpecializations

  const handleLocationRequest = useCallback(() => {
    /* для фильтров геолокацию не используем — город выбирается вручную */
  }, [])

  return {
    ...filters,
    maxRateLimit,
    displayPriceRange,
    handleRangeChange,
    handleMinInputChange,
    handleMaxInputChange,
    positions,
    displaySpecializations,
    isSpecializationsLoading: shouldShowPrevious,
    handlePositionClick,
    handleLocationRequest,
    getMinStartDate: todayKey,
    getMinEndDate: () => filters.startDate ?? todayKey(),
    previewCount: filteredCount ?? 0,
  }
}
