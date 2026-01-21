/**
 * Хук для управления состоянием и логикой расширенных фильтров
 * Инкапсулирует всю бизнес-логику работы с фильтрами
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setSelectedPosition as setSelectedPositionAction } from '@/features/navigation/model/catalogSlice'
import type { AdvancedFiltersData } from '../components/AdvancedFilters'
import { hasActiveFilters as checkHasActiveFilters } from '@/utils/filters'

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
   * При сбросе может быть вызван с `null` (означает отсутствие расширенных фильтров)
   */
  onApply: (filters: AdvancedFiltersData | null) => void
  /**
   * Callback при сбросе фильтров
   */
  onReset?: () => void
  /**
   * Задержка перед применением фильтров (debounce) в миллисекундах
   */
  debounceMs?: number
  /**
   * Флаг для вакансий (используется для разных дефолтных значений диапазона цен)
   */
  isVacancy?: boolean
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
  // Не устанавливаем дефолтные значения - пользователь должен выбрать сам
  const [priceRange, setPriceRange] = useState<[number, number] | null>(
    initialFilters?.priceRange || null
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
        // Сбрасываем к пустым значениям
        setPriceRange(null)
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
    // Сбрасываем локальное состояние
    setPriceRange(null)
    setSelectedPosition(null)
    setSelectedSpecializations([])
    setStartDate(null)
    setEndDate(null)
    dispatch(setSelectedPositionAction(null))

    // Внешний сброс (quick-фильтры и т.д.)
    onReset?.()
    // Немедленно сообщаем наружу об отсутствии расширенных фильтров
    onApply(null)
    // Готовим к следующему применению
    isInitialMountRef.current = true
  }, [onReset, dispatch, onApply])

  // Формируем текущие фильтры
  const currentFilters = useMemo<AdvancedFiltersData | null>(() => {
    // Если нет ни одного фильтра - возвращаем null
    const hasPriceFilter = priceRange !== null
    const hasPosition = selectedPosition !== null
    const hasSpecializations = selectedSpecializations.length > 0
    const hasDates = startDate !== null || endDate !== null

    if (!hasPriceFilter && !hasPosition && !hasSpecializations && !hasDates) {
      return null
    }

    return {
      priceRange: priceRange, // null если не выбрано
      selectedPosition: selectedPosition || undefined,
      selectedSpecializations: selectedSpecializations.length > 0 ? selectedSpecializations : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }
  }, [priceRange, selectedPosition, selectedSpecializations, startDate, endDate])

  // Проверяем, есть ли активные фильтры
  const hasActiveFiltersValue = useMemo(
    () => checkHasActiveFilters(currentFilters),
    [currentFilters]
  )

  // Автоматическое применение фильтров с debounce (при открытом модальном окне)
  useEffect(() => {
    // Пропускаем самое первое срабатывание после открытия модалки (инициализация)
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

