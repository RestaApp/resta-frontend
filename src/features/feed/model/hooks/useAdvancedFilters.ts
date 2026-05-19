import { useState, useCallback, useMemo, useEffect } from 'react'
import { hasActiveFilters as checkHasActiveFilters, normalizeAdvancedFilters } from '@/utils/filters'
import type { AdvancedFiltersData } from '../types'

interface UseAdvancedFiltersOptions {
  initialFilters?: AdvancedFiltersData | null
  onApply: (filters: AdvancedFiltersData | null) => void
}

export const useAdvancedFilters = ({
  initialFilters = null,
  onApply,
}: UseAdvancedFiltersOptions) => {
  const [selectedCity, setSelectedCity] = useState<string>(() => initialFilters?.selectedCity ?? '')
  const [selectedPosition, setSelectedPosition] = useState<string | null>(
    () => initialFilters?.selectedPosition ?? null
  )
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    () => initialFilters?.selectedSpecializations ?? []
  )

  useEffect(() => {
    setSelectedCity(initialFilters?.selectedCity ?? '')
    setSelectedPosition(initialFilters?.selectedPosition ?? null)
    setSelectedSpecializations(initialFilters?.selectedSpecializations ?? [])
  }, [initialFilters])

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

  const currentFilters = useMemo<AdvancedFiltersData | null>(() => {
    const draft: AdvancedFiltersData = {
      selectedCity: selectedCity.trim() || undefined,
      selectedPosition: selectedPosition || undefined,
      selectedSpecializations: selectedSpecializations.length ? selectedSpecializations : undefined,
    }
    return checkHasActiveFilters(draft) ? draft : null
  }, [selectedCity, selectedPosition, selectedSpecializations])

  const hasActiveFilters = currentFilters !== null

  const handleReset = useCallback(() => {
    setSelectedCity('')
    setSelectedPosition(null)
    setSelectedSpecializations([])
  }, [])

  const handleApply = useCallback(() => {
    onApply(normalizeAdvancedFilters(currentFilters))
  }, [onApply, currentFilters])

  return {
    selectedCity,
    selectedPosition,
    selectedSpecializations,
    setSelectedCity,
    handlePositionSelect,
    toggleSpecialization,

    hasActiveFilters,
    handleReset,
    handleApply,
  }
}
