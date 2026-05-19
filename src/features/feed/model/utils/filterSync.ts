import type { AdvancedFiltersData } from '../types'

export const createInitialFilters = (
  userPosition?: string | null,
  userCity?: string | null
): AdvancedFiltersData | null => {
  const hasPosition = Boolean(userPosition)
  const hasCity = Boolean(userCity && userCity.trim())
  if (!hasPosition && !hasCity) return null

  return {
    selectedCity: userCity?.trim() || undefined,
    selectedPosition: userPosition || undefined,
    selectedSpecializations: undefined,
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
      selectedCity: selectedCity?.trim() || undefined,
      selectedPosition,
      selectedSpecializations: selectedSpecializations?.length ? selectedSpecializations : undefined,
    }
  }

  return {
    ...targetFilters,
    selectedCity: selectedCity?.trim() || undefined,
    selectedPosition,
    selectedSpecializations: selectedSpecializations?.length ? selectedSpecializations : undefined,
  }
}
