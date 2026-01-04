/**
 * Утилиты для работы с фильтрами
 */

import type { AdvancedFiltersData } from '@/pages/Feed/components/AdvancedFilters'
import { getEmployeePositionLabel, getSpecializationLabel } from '@/constants/labels'

export const DEFAULT_PRICE_RANGE: [number, number] = [0, 1000]

/**
 * Проверяет, является ли диапазон цен значением по умолчанию
 */
export const isDefaultPriceRange = (priceRange: [number, number]): boolean => {
  return priceRange[0] === DEFAULT_PRICE_RANGE[0] && priceRange[1] === DEFAULT_PRICE_RANGE[1]
}

/**
 * Форматирует дату для отображения в фильтрах
 */
export const formatFilterDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  } catch {
    return dateStr
  }
}

/**
 * Форматирует диапазон дат для отображения
 */
export const formatDateRange = (
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string | null => {
  if (startDate && endDate) {
    return `${formatFilterDate(startDate)}-${formatFilterDate(endDate)}`
  }
  if (startDate) {
    return `От ${formatFilterDate(startDate)}`
  }
  if (endDate) {
    return `До ${formatFilterDate(endDate)}`
  }
  return null
}

/**
 * Форматирует специализации для отображения
 * Показывает первые 2, остальные как "+N"
 */
export const formatSpecializations = (specializations: string[]): string[] => {
  if (specializations.length === 0) return []
  
  if (specializations.length <= 2) {
    return specializations.map(spec => getSpecializationLabel(spec))
  }
  
  return [
    ...specializations.slice(0, 2).map(spec => getSpecializationLabel(spec)),
    `+${specializations.length - 2}`
  ]
}

/**
 * Преобразует фильтры в список строк для отображения
 */
export const formatFiltersForDisplay = (filters: AdvancedFiltersData | null): string[] => {
  if (!filters) return []

  const result: string[] = []

  // Позиция
  if (filters.selectedPosition) {
    result.push(getEmployeePositionLabel(filters.selectedPosition))
  }

  // Специализации
  if (filters.selectedSpecializations && filters.selectedSpecializations.length > 0) {
    result.push(...formatSpecializations(filters.selectedSpecializations))
  }

  // Диапазон цен (если не по умолчанию)
  if (!isDefaultPriceRange(filters.priceRange)) {
    result.push(`${filters.priceRange[0]}-${filters.priceRange[1]} BYN`)
  }

  // Даты
  const dateRange = formatDateRange(filters.startDate, filters.endDate)
  if (dateRange) {
    result.push(dateRange)
  }

  return result
}

/**
 * Проверяет, есть ли активные фильтры (кроме значений по умолчанию)
 */
export const hasActiveFilters = (filters: AdvancedFiltersData | null): boolean => {
  if (!filters) return false

  const hasNonDefaultPrice = !isDefaultPriceRange(filters.priceRange)
  const hasPosition = filters.selectedPosition !== null && filters.selectedPosition !== undefined
  const hasSpecializations = (filters.selectedSpecializations?.length ?? 0) > 0
  const hasDates = filters.startDate !== null || filters.endDate !== null

  return hasNonDefaultPrice || hasPosition || hasSpecializations || hasDates
}

