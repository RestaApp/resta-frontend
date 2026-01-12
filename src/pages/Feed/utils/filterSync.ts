import type { AdvancedFiltersData } from '../components/AdvancedFilters'

export const createInitialFilters = (userPosition?: string | null): AdvancedFiltersData | null => {
  if (!userPosition) return null

  return {
    priceRange: null,
    selectedPosition: userPosition,
    selectedSpecializations: [],
    startDate: null,
    endDate: null,
  }
}

export const syncFiltersPositionAndSpecializations = (
  sourceFilters: AdvancedFiltersData | null,
  targetFilters: AdvancedFiltersData | null
): AdvancedFiltersData | null => {
  if (!sourceFilters) return targetFilters

  const { selectedPosition, selectedSpecializations } = sourceFilters

  if (!targetFilters) {
    return {
      priceRange: null,
      selectedPosition,
      selectedSpecializations: selectedSpecializations || [],
      startDate: null,
      endDate: null,
    }
  }

  return {
    ...targetFilters,
    selectedPosition,
    selectedSpecializations: selectedSpecializations || [],
  }
}
