import { useState, useCallback, useMemo, useEffect } from 'react'
import { hasActiveFilters as checkHasActiveFilters } from '@/utils/filters'
import type { AdvancedFiltersData } from '../../ui/components/AdvancedFilters'
import type { WhenPreset } from '../utils/feedFilterWhen'
import { getWhenPresetRange } from '../utils/feedFilterWhen'

const initialDatesFromFilters = (
  initial: AdvancedFiltersData | null,
  isVacancy: boolean
): { start: string | null; end: string | null; when: WhenPreset | null } => {
  if (!initial) return { start: null, end: null, when: null }
  const when = !isVacancy ? initial.whenPreset ?? null : null
  if (when && !initial.startDate) {
    const r = getWhenPresetRange(when)
    return { start: r.startDate, end: r.endDate, when }
  }
  return {
    start: initial.startDate ?? null,
    end: initial.endDate ?? null,
    when,
  }
}

interface UseAdvancedFiltersOptions {
  initialFilters?: AdvancedFiltersData | null
  onApply: (filters: AdvancedFiltersData | null) => void
  /** Только для смен: пресет «когда» и даты. */
  isVacancy: boolean
}

export const useAdvancedFilters = ({
  initialFilters = null,
  onApply,
  isVacancy,
}: UseAdvancedFiltersOptions) => {
  const [selectedCity, setSelectedCity] = useState<string>(() => initialFilters?.selectedCity ?? '')
  const [selectedPosition, setSelectedPosition] = useState<string | null>(
    () => initialFilters?.selectedPosition ?? null
  )
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    () => initialFilters?.selectedSpecializations ?? []
  )
  const initialSnap = initialDatesFromFilters(initialFilters, isVacancy)
  const [startDate, setStartDate] = useState<string | null>(initialSnap.start)
  const [endDate, setEndDate] = useState<string | null>(initialSnap.end)
  const [whenPreset, setWhenPreset] = useState<WhenPreset | null>(initialSnap.when)

  useEffect(() => {
    const d = initialDatesFromFilters(initialFilters, isVacancy)
    setStartDate(d.start)
    setEndDate(d.end)
    setWhenPreset(d.when)
    setSelectedCity(initialFilters?.selectedCity ?? '')
    setSelectedPosition(initialFilters?.selectedPosition ?? null)
    setSelectedSpecializations(initialFilters?.selectedSpecializations ?? [])
    setGeoLat(initialFilters?.geoLat ?? null)
    setGeoLon(initialFilters?.geoLon ?? null)
    setRadiusKm(initialFilters?.radiusKm ?? 2)
  }, [initialFilters, isVacancy])

  const [geoLat, setGeoLat] = useState<number | null>(() => initialFilters?.geoLat ?? null)
  const [geoLon, setGeoLon] = useState<number | null>(() => initialFilters?.geoLon ?? null)
  const [radiusKm, setRadiusKm] = useState<number>(() => initialFilters?.radiusKm ?? 2)

  const hasSharedGeo = geoLat !== null && geoLon !== null && Number.isFinite(geoLat) && Number.isFinite(geoLon)

  const handleStartDateChange = useCallback((value: string | null) => {
    setStartDate(value)
    setWhenPreset(null)
    setEndDate(prev => {
      if (value && prev && prev < value) return null
      return prev
    })
  }, [])

  const handleEndDateChange = useCallback(
    (value: string | null) => {
      if (value && startDate && value < startDate) {
        setEndDate(null)
        return
      }
      setEndDate(value)
      setWhenPreset(null)
    },
    [startDate]
  )

  const setWhenPresetAndDates = useCallback(
    (preset: WhenPreset | null) => {
      if (isVacancy) return
      setWhenPreset(preset)
      if (!preset) {
        setStartDate(null)
        setEndDate(null)
        return
      }
      const { startDate: s, endDate: e } = getWhenPresetRange(preset)
      setStartDate(s)
      setEndDate(e)
    },
    [isVacancy]
  )

  const handlePositionSelect = useCallback(
    (position: string) => {
      if (selectedPosition === position) {
        setSelectedPosition(null)
        setSelectedSpecializations([])
      } else {
        setSelectedPosition(position)
        setSelectedSpecializations([])
      }
    },
    [selectedPosition]
  )

  const toggleSpecialization = useCallback((specialization: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(specialization)
        ? prev.filter(s => s !== specialization)
        : [...prev, specialization]
    )
  }, [])

  const setSharedCoordinates = useCallback((lat: number | null, lon: number | null) => {
    setGeoLat(lat)
    setGeoLon(lon)
    if (lat !== null && lon !== null) {
      setSelectedCity('')
    }
    if (lat === null || lon === null) {
      setRadiusKm(2)
    }
  }, [])

  const currentFilters = useMemo<AdvancedFiltersData | null>(() => {
    const draft: AdvancedFiltersData = {
      selectedCity: selectedCity.trim() || undefined,
      selectedPosition: selectedPosition || undefined,
      selectedSpecializations: selectedSpecializations.length ? selectedSpecializations : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      whenPreset: !isVacancy && whenPreset ? whenPreset : undefined,
      geoLat: hasSharedGeo ? geoLat ?? undefined : undefined,
      geoLon: hasSharedGeo ? geoLon ?? undefined : undefined,
      radiusKm: hasSharedGeo ? radiusKm : undefined,
    }
    return checkHasActiveFilters(draft) ? draft : null
  }, [
    selectedCity,
    selectedPosition,
    selectedSpecializations,
    startDate,
    endDate,
    whenPreset,
    isVacancy,
    hasSharedGeo,
    geoLat,
    geoLon,
    radiusKm,
  ])

  const hasActiveFilters = useMemo(() => checkHasActiveFilters(currentFilters), [currentFilters])

  const handleReset = useCallback(() => {
    setSelectedCity('')
    setSelectedPosition(null)
    setSelectedSpecializations([])
    handleStartDateChange(null)
    handleEndDateChange(null)
    setWhenPresetAndDates(null)
    setSharedCoordinates(null, null)
  }, [handleEndDateChange, handleStartDateChange, setSharedCoordinates, setWhenPresetAndDates])

  const handleApply = useCallback(() => {
    onApply(currentFilters)
  }, [onApply, currentFilters])

  return {
    selectedCity,
    selectedPosition,
    selectedSpecializations,
    startDate,
    endDate,
    whenPreset,
    geoLat,
    geoLon,
    radiusKm,
    hasSharedGeo,

    setSelectedCity,
    setStartDate: handleStartDateChange,
    setEndDate: handleEndDateChange,
    setWhenPresetAndDates,
    setRadiusKm,
    setSharedCoordinates,
    handlePositionSelect,
    toggleSpecialization,

    hasActiveFilters,
    currentFilters,
    handleReset,
    handleApply,
  }
}
