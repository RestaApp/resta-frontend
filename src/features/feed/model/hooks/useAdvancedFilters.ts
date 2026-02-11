import { useState, useCallback, useMemo } from 'react'
import type { AdvancedFiltersData } from '../../ui/components/AdvancedFilters'
import { hasActiveFilters as checkHasActiveFilters } from '@/utils/filters'

interface UseAdvancedFiltersOptions {
  initialFilters?: AdvancedFiltersData | null
  onApply: (filters: AdvancedFiltersData | null) => void
}

export const useAdvancedFilters = ({
  initialFilters = null,
  onApply,
}: UseAdvancedFiltersOptions) => {
  // draft state (редактируем в модалке)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(
    () => initialFilters?.priceRange ?? null
  )
  const [selectedPosition, setSelectedPosition] = useState<string | null>(
    () => initialFilters?.selectedPosition ?? null
  )
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    () => initialFilters?.selectedSpecializations ?? []
  )
  const [startDate, setStartDate] = useState<string | null>(() => initialFilters?.startDate ?? null)
  const [endDate, setEndDate] = useState<string | null>(() => initialFilters?.endDate ?? null)

  const handleStartDateChange = useCallback((value: string | null) => {
    setStartDate(value)
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
    },
    [startDate]
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

  // текущие draft-фильтры (то, что пользователь “собрал”)
  const currentFilters = useMemo<AdvancedFiltersData | null>(() => {
    const hasPrice = priceRange !== null
    const hasPos = selectedPosition !== null
    const hasSpecs = selectedSpecializations.length > 0
    const hasDates = startDate !== null || endDate !== null

    if (!hasPrice && !hasPos && !hasSpecs && !hasDates) return null

    return {
      priceRange,
      selectedPosition: selectedPosition || undefined,
      selectedSpecializations: selectedSpecializations.length ? selectedSpecializations : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }
  }, [priceRange, selectedPosition, selectedSpecializations, startDate, endDate])

  const hasActiveFilters = useMemo(() => checkHasActiveFilters(currentFilters), [currentFilters])

  const handleReset = useCallback(() => {
    setPriceRange(null)
    setSelectedPosition(null)
    setSelectedSpecializations([])
    handleStartDateChange(null)
    handleEndDateChange(null)
  }, [handleEndDateChange, handleStartDateChange])

  // НОВОЕ: явное применение по кнопке
  const handleApply = useCallback(() => {
    onApply(currentFilters)
  }, [onApply, currentFilters])

  return {
    // draft state
    priceRange,
    selectedPosition,
    selectedSpecializations,
    startDate,
    endDate,

    // setters
    setPriceRange,
    setStartDate: handleStartDateChange,
    setEndDate: handleEndDateChange,
    handlePositionSelect,
    toggleSpecialization,

    // computed
    hasActiveFilters,
    currentFilters,

    // actions
    handleReset,
    handleApply,
  }
}
