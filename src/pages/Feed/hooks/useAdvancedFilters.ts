/**
 * Хук для управления состоянием и логикой расширенных фильтров
 * Инкапсулирует всю бизнес-логику работы с фильтрами
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setSelectedPosition as setSelectedPositionAction } from '@/store/catalogSlice'
import type { AdvancedFiltersData } from '../components/AdvancedFilters'
import { DEFAULT_PRICE_RANGE, hasActiveFilters as checkHasActiveFilters } from '@/utils/filters'

interface UseAdvancedFiltersOptions {
  /**
   * Начальные значения фильтров
   */
  initialFilters?: AdvancedFiltersData | null
  /**
   * Открыто ли модальное окно фильтров
   */
  isOpen: boolean
  /**
   * Callback при применении фильтров
   */
  onApply: (filters: AdvancedFiltersData) => void
  /**
   * Callback при сбросе фильтров
   */
  onReset?: () => void
  /**
   * Задержка перед применением фильтров (debounce) в миллисекундах
   */
  debounceMs?: number
}

export const useAdvancedFilters = ({
  initialFilters = null,
  isOpen,
  onApply,
  onReset,
  debounceMs = 300,
}: UseAdvancedFiltersOptions) => {
  const dispatch = useAppDispatch()

  // Локальное состояние фильтров
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialFilters?.priceRange || DEFAULT_PRICE_RANGE
  )
  const [selectedPosition, setSelectedPosition] = useState<string | null>(
    initialFilters?.selectedPosition || null
  )
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    initialFilters?.selectedSpecializations || []
  )
  const [startDate, setStartDate] = useState<string | null>(
    initialFilters?.startDate || null
  )
  const [endDate, setEndDate] = useState<string | null>(
    initialFilters?.endDate || null
  )

  // Refs для отслеживания состояния модального окна
  const prevIsOpenRef = useRef(false)
  const isInitialMountRef = useRef(true)
  const prevIsOpenForApplyRef = useRef(false)

  // Синхронизация с initialFilters при открытии модального окна
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      if (initialFilters) {
        setPriceRange(initialFilters.priceRange)
        setSelectedPosition(initialFilters.selectedPosition || null)
        setSelectedSpecializations(initialFilters.selectedSpecializations || [])
        setStartDate(initialFilters.startDate || null)
        setEndDate(initialFilters.endDate || null)
      } else {
        // Сбрасываем к значениям по умолчанию
        setPriceRange(DEFAULT_PRICE_RANGE)
        setSelectedPosition(null)
        setSelectedSpecializations([])
        setStartDate(null)
        setEndDate(null)
      }
    }

    prevIsOpenRef.current = isOpen
  }, [isOpen, initialFilters])

  // Сбрасываем endDate, если он меньше startDate
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      if (end < start) {
        setEndDate(null)
      }
    }
  }, [startDate, endDate])

  // Обработчики изменения фильтров
  const handlePositionSelect = useCallback(
    (position: string) => {
      if (selectedPosition === position) {
        // Снимаем выбор
        setSelectedPosition(null)
        setSelectedSpecializations([])
        dispatch(setSelectedPositionAction(null))
      } else {
        // Выбираем новую позицию
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

  const handleReset = useCallback(() => {
    setPriceRange(DEFAULT_PRICE_RANGE)
    setSelectedPosition(null)
    setSelectedSpecializations([])
    setStartDate(null)
    setEndDate(null)
    dispatch(setSelectedPositionAction(null))
    onReset?.()
  }, [onReset, dispatch])

  // Формируем текущие фильтры
  const currentFilters = useMemo<AdvancedFiltersData>(
    () => ({
      priceRange,
      selectedPosition,
      selectedSpecializations,
      startDate,
      endDate,
    }),
    [priceRange, selectedPosition, selectedSpecializations, startDate, endDate]
  )

  // Проверяем, есть ли активные фильтры
  const hasActiveFiltersValue = useMemo(
    () => checkHasActiveFilters(currentFilters),
    [currentFilters]
  )

  // Автоматическое применение фильтров с debounce
  useEffect(() => {
    // При открытии модального окна сбрасываем флаг
    if (isOpen && !prevIsOpenForApplyRef.current) {
      isInitialMountRef.current = true
      prevIsOpenForApplyRef.current = true
      return
    }

    // При закрытии модального окна применяем текущие фильтры
    if (!isOpen && prevIsOpenForApplyRef.current) {
      onApply(currentFilters)
      prevIsOpenForApplyRef.current = false
      isInitialMountRef.current = true
      return
    }

    // Пропускаем первое применение после открытия модального окна
    if (isOpen && isInitialMountRef.current) {
      isInitialMountRef.current = false
      return
    }

    // Применяем фильтры при изменении (с debounce)
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        onApply(currentFilters)
      }, debounceMs)

      return () => clearTimeout(timeoutId)
    }
  }, [currentFilters, onApply, isOpen, debounceMs])

  return {
    // Состояние фильтров
    priceRange,
    selectedPosition,
    selectedSpecializations,
    startDate,
    endDate,

    // Методы изменения
    setPriceRange,
    setSelectedPosition,
    setStartDate,
    setEndDate,
    handlePositionSelect,
    toggleSpecialization,
    handleReset,

    // Вычисляемые значения
    hasActiveFilters: hasActiveFiltersValue,
    currentFilters,
  }
}

