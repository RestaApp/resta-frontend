import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setSelectedPosition as setSelectedPositionAction } from '@/features/navigation/model/catalogSlice'
import type { AdvancedFiltersData } from '../../ui/components/AdvancedFilters'
import { hasActiveFilters as checkHasActiveFilters } from '@/utils/filters'

interface UseAdvancedFiltersOptions {
  initialFilters?: AdvancedFiltersData | null
  isOpen: boolean
  onApply: (filters: AdvancedFiltersData | null) => void
}

export const useAdvancedFilters = ({
  initialFilters = null,
  isOpen,
  onApply,
}: UseAdvancedFiltersOptions) => {
  const dispatch = useAppDispatch()

  // draft state (редактируем в модалке)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)

  const prevIsOpenRef = useRef(false)

  // при открытии — заливаем initialFilters в draft
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setPriceRange(initialFilters?.priceRange ?? null)
      setSelectedPosition(initialFilters?.selectedPosition ?? null)
      setSelectedSpecializations(initialFilters?.selectedSpecializations ?? [])
      setStartDate(initialFilters?.startDate ?? null)
      setEndDate(initialFilters?.endDate ?? null)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, initialFilters])

  // endDate не может быть меньше startDate (для строк YYYY-MM-DD)
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) setEndDate(null)
  }, [startDate, endDate])

  const handlePositionSelect = useCallback(
    (position: string) => {
      if (selectedPosition === position) {
        setSelectedPosition(null)
        setSelectedSpecializations([])
        dispatch(setSelectedPositionAction(null))
      } else {
        setSelectedPosition(position)
        setSelectedSpecializations([])
        dispatch(setSelectedPositionAction(position))
      }
    },
    [selectedPosition, dispatch]
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

  const hasActiveFilters = useMemo(
    () => checkHasActiveFilters(currentFilters),
    [currentFilters]
  )

  const handleReset = useCallback(() => {
    setPriceRange(null)
    setSelectedPosition(null)
    setSelectedSpecializations([])
    setStartDate(null)
    setEndDate(null)
    dispatch(setSelectedPositionAction(null))
  }, [dispatch])

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
    setStartDate,
    setEndDate,
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
