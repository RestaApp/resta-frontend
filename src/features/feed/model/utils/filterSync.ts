import type { AdvancedFiltersData } from '../../ui/components/AdvancedFilters'

export const createInitialFilters = (
  userPosition?: string | null,
  userCity?: string | null
): AdvancedFiltersData | null => {
  const hasPosition = Boolean(userPosition)
  const hasCity = Boolean(userCity && userCity.trim())
  if (!hasPosition && !hasCity) return null

  return {
    priceRange: null,
    selectedCity: userCity?.trim() || null,
    selectedPosition: userPosition || null,
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

  const { selectedCity, selectedPosition, selectedSpecializations } = sourceFilters

  if (!targetFilters) {
    return {
      priceRange: null,
      selectedCity: selectedCity || null,
      selectedPosition,
      selectedSpecializations: selectedSpecializations || [],
      startDate: null,
      endDate: null,
    }
  }

  return {
    ...targetFilters,
    selectedCity: selectedCity || null,
    selectedPosition,
    selectedSpecializations: selectedSpecializations || [],
  }
}
