/**
 * Утилиты для синхронизации фильтров между сменами и вакансиями
 */

import type { AdvancedFiltersData } from '../components/AdvancedFilters'

/**
 * Создает начальные фильтры для указанного типа фида
 */
export const createInitialFilters = (
  userPosition?: string | null
): AdvancedFiltersData | null => {
  if (!userPosition) return null

  return {
    priceRange: null, // Пользователь должен сам выбрать цену
    selectedPosition: userPosition,
    selectedSpecializations: [],
    startDate: null,
    endDate: null,
  }
}

/**
 * Синхронизирует позицию и специализации между фильтрами смен и вакансий
 * Сохраняет индивидуальные значения для цены и дат
 */
export const syncFiltersPositionAndSpecializations = (
  sourceFilters: AdvancedFiltersData | null,
  targetFilters: AdvancedFiltersData | null
): AdvancedFiltersData | null => {
  if (!sourceFilters) return targetFilters

  const { selectedPosition, selectedSpecializations } = sourceFilters

  // Если целевых фильтров нет, создаем новые с синхронизированными позицией/специализацией
  if (!targetFilters) {
    return {
      priceRange: null, // Пользователь должен сам выбрать цену
      selectedPosition,
      selectedSpecializations: selectedSpecializations || [],
      startDate: null,
      endDate: null,
    }
  }

  // Обновляем только позицию и специализации, сохраняя цену и даты
  return {
    ...targetFilters,
    selectedPosition,
    selectedSpecializations: selectedSpecializations || [],
  }
}

