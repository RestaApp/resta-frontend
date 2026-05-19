import { useEffect, useState } from 'react'
import { useUserPositions } from '@/features/navigation/model/hooks/useUserPositions'
import { useUserSpecializations } from '@/features/navigation/model/hooks/useUserSpecializations'
import { useAdvancedFilters } from './useAdvancedFilters'
import type { AdvancedFiltersData } from '../types'

interface UseAdvancedFiltersSheetParams {
  initialFilters: AdvancedFiltersData | null
  onApply: (filters: AdvancedFiltersData | null) => void
}

/**
 * Контроллер листа фильтров ленты: позиции, город, специализации.
 */
export const useAdvancedFiltersSheet = ({
  initialFilters,
  onApply,
}: UseAdvancedFiltersSheetParams) => {
  const filters = useAdvancedFilters({ initialFilters, onApply })
  const { selectedPosition } = filters
  const [previousSpecializations, setPreviousSpecializations] = useState<string[]>([])

  const { positions } = useUserPositions({ enabled: true })
  const { specializations, isLoading, isFetching } = useUserSpecializations({
    position: selectedPosition,
    enabled: !!selectedPosition,
  })
  const isSpecializationsLoading = isLoading || isFetching

  useEffect(() => {
    if (!isSpecializationsLoading && specializations.length > 0) {
      setPreviousSpecializations(specializations)
    }
  }, [isSpecializationsLoading, specializations])

  const displaySpecializations =
    isSpecializationsLoading && previousSpecializations.length > 0
      ? previousSpecializations
      : specializations

  return {
    ...filters,
    positions,
    displaySpecializations,
  }
}
