import { useCallback, useState } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useUserPositions } from '@/features/navigation/model/hooks/useUserPositions'
import { useUserSpecializations } from '@/features/navigation/model/hooks/useUserSpecializations'
import { useAdvancedFilters } from './useAdvancedFilters'
import type { AdvancedFiltersData } from '../../ui/components/AdvancedFilters'

interface UseAdvancedFiltersSheetParams {
  initialFilters: AdvancedFiltersData | null
  onApply: (filters: AdvancedFiltersData | null) => void
  isVacancy: boolean
  filteredCount: number | undefined
}

/**
 * Контроллер листа фильтров ленты: позиции, «когда» (смены), гео/город, специализации.
 */
export const useAdvancedFiltersSheet = ({
  initialFilters,
  onApply,
  isVacancy,
  filteredCount,
}: UseAdvancedFiltersSheetParams) => {
  const filters = useAdvancedFilters({ initialFilters, onApply, isVacancy })
  const { selectedPosition, handlePositionSelect, setSharedCoordinates } = filters

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

  const { getCoordinates, isLoading: isGeoLoading } = useGeolocation()

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

  const isLoadingSpecs = isLoadingSpecializations || isFetchingSpecializations
  const shouldShowPrevious = isLoadingSpecs && previousSpecializations.length > 0
  const displaySpecializations = shouldShowPrevious
    ? previousSpecializations
    : availableSpecializations

  const handleLocationRequest = useCallback(async () => {
    const coords = await getCoordinates()
    if (coords) {
      setSharedCoordinates(coords.latitude, coords.longitude)
    }
  }, [getCoordinates, setSharedCoordinates])

  return {
    ...filters,
    positions,
    displaySpecializations,
    isSpecializationsLoading: shouldShowPrevious,
    handlePositionClick,
    handleLocationRequest,
    isGeoLoading,
    previewCount: filteredCount ?? 0,
  }
}
