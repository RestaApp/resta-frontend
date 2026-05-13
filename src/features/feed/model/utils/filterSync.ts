import type { AdvancedFiltersData } from '../../ui/components/AdvancedFilters'

export const createInitialFilters = (
  userPosition?: string | null,
  userCity?: string | null
): AdvancedFiltersData | null => {
  const hasPosition = Boolean(userPosition)
  const hasCity = Boolean(userCity && userCity.trim())
  if (!hasPosition && !hasCity) return null

  return {
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

  const {
    selectedCity,
    selectedPosition,
    selectedSpecializations,
    whenPreset,
    startDate,
    endDate,
    geoLat,
    geoLon,
    radiusKm,
  } = sourceFilters

  if (!targetFilters) {
    return {
      selectedCity: selectedCity || null,
      selectedPosition,
      selectedSpecializations: selectedSpecializations || [],
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      whenPreset: whenPreset ?? undefined,
      geoLat: geoLat ?? undefined,
      geoLon: geoLon ?? undefined,
      radiusKm: radiusKm ?? undefined,
    }
  }

  return {
    ...targetFilters,
    selectedCity: selectedCity || null,
    selectedPosition,
    selectedSpecializations: selectedSpecializations || [],
    whenPreset: whenPreset ?? targetFilters.whenPreset,
    startDate: startDate ?? targetFilters.startDate,
    endDate: endDate ?? targetFilters.endDate,
    geoLat: geoLat ?? targetFilters.geoLat,
    geoLon: geoLon ?? targetFilters.geoLon,
    radiusKm: radiusKm ?? targetFilters.radiusKm,
  }
}
