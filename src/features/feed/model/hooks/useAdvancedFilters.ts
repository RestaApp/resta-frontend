import { useState, useCallback, useMemo } from 'react'
import {
  hasActiveFilters as checkHasActiveFilters,
  normalizeAdvancedFilters,
} from '@/shared/utils/filters'
import type { DateFilterPreset, SalaryRangeId } from '@/shared/shifts/filterConstants'
import type { AdvancedFiltersData } from '@/shared/shifts/types'

interface UseAdvancedFiltersOptions {
  initialFilters?: AdvancedFiltersData | null
  onApply: (filters: AdvancedFiltersData | null) => void
  includeDateFilter?: boolean
}

export const useAdvancedFilters = ({
  initialFilters = null,
  onApply,
  includeDateFilter = true,
}: UseAdvancedFiltersOptions) => {
  const [selectedCity, setSelectedCity] = useState<string>(() => initialFilters?.selectedCity ?? '')
  const [selectedPosition, setSelectedPosition] = useState<string | null>(
    () => initialFilters?.selectedPosition ?? null
  )
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    () => initialFilters?.selectedSpecializations ?? []
  )
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<SalaryRangeId | null>(
    () => initialFilters?.selectedSalaryRange ?? null
  )
  const [selectedDatePreset, setSelectedDatePreset] = useState<DateFilterPreset | null>(() =>
    includeDateFilter ? (initialFilters?.selectedDatePreset ?? null) : null
  )
  const [customStartDate, setCustomStartDate] = useState<string | null>(() =>
    includeDateFilter ? (initialFilters?.customStartDate ?? null) : null
  )
  const [customEndDate, setCustomEndDate] = useState<string | null>(() =>
    includeDateFilter ? (initialFilters?.customEndDate ?? null) : null
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

  const handleSalaryRangeSelect = useCallback((rangeId: SalaryRangeId) => {
    setSelectedSalaryRange(prev => (prev === rangeId ? null : rangeId))
  }, [])

  const handleDatePresetSelect = useCallback(
    (preset: DateFilterPreset) => {
      const next = selectedDatePreset === preset ? null : preset
      setSelectedDatePreset(next)
      if (next !== 'custom') {
        setCustomStartDate(null)
        setCustomEndDate(null)
      }
    },
    [selectedDatePreset]
  )

  const currentFilters = useMemo<AdvancedFiltersData | null>(() => {
    const draft: AdvancedFiltersData = {
      selectedCity: selectedCity.trim() || undefined,
      selectedPosition: selectedPosition || undefined,
      selectedSpecializations: selectedSpecializations.length ? selectedSpecializations : undefined,
      selectedSalaryRange: selectedSalaryRange || undefined,
    }

    if (includeDateFilter) {
      draft.selectedDatePreset = selectedDatePreset || undefined
      draft.customStartDate = customStartDate || undefined
      draft.customEndDate = customEndDate || undefined
    }

    return checkHasActiveFilters(draft) ? draft : null
  }, [
    selectedCity,
    selectedPosition,
    selectedSpecializations,
    selectedSalaryRange,
    selectedDatePreset,
    customStartDate,
    customEndDate,
    includeDateFilter,
  ])

  const hasActiveFilters = currentFilters !== null

  const handleReset = useCallback(() => {
    setSelectedCity('')
    setSelectedPosition(null)
    setSelectedSpecializations([])
    setSelectedSalaryRange(null)
    setSelectedDatePreset(null)
    setCustomStartDate(null)
    setCustomEndDate(null)
  }, [])

  const handleApply = useCallback(() => {
    onApply(normalizeAdvancedFilters(currentFilters))
  }, [onApply, currentFilters])

  return {
    selectedCity,
    selectedPosition,
    selectedSpecializations,
    selectedSalaryRange,
    selectedDatePreset,
    customStartDate,
    customEndDate,
    setSelectedCity,
    setCustomStartDate,
    setCustomEndDate,
    handlePositionSelect,
    toggleSpecialization,
    handleSalaryRangeSelect,
    handleDatePresetSelect,

    hasActiveFilters,
    handleReset,
    handleApply,
  }
}
