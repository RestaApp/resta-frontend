/**
 * Утилиты для работы с фильтрами
 */

import type { AdvancedFiltersData } from '@/features/feed/model/types'
import i18n from '@/shared/i18n/config'
import { normalizeCatalogPosition } from '@/utils/roles'

const getSpecializationLabel = (spec: string): string =>
  i18n.t(`labels.specialization.${spec}`) || spec
const getEmployeePositionLabel = (value: string): string => {
  const positionKey = normalizeCatalogPosition(value)
  return i18n.t(`labels.position.${positionKey}`) || value
}

const formatSpecializations = (specializations: string[]): string[] => {
  if (specializations.length === 0) return []
  if (specializations.length <= 2) {
    return specializations.map(spec => getSpecializationLabel(spec))
  }
  return [
    ...specializations.slice(0, 2).map(spec => getSpecializationLabel(spec)),
    `+${specializations.length - 2}`,
  ]
}

/**
 * Нормализует черновик фильтров перед сохранением / apply.
 */
export const normalizeAdvancedFilters = (
  filters: AdvancedFiltersData | null
): AdvancedFiltersData | null => {
  if (!filters) return null

  const normalized: AdvancedFiltersData = {
    selectedCity: filters.selectedCity?.trim() || undefined,
    selectedPosition: filters.selectedPosition || undefined,
    selectedSpecializations: filters.selectedSpecializations?.length
      ? filters.selectedSpecializations
      : undefined,
  }

  return hasActiveFilters(normalized) ? normalized : null
}

/**
 * Преобразует фильтры в список строк для отображения
 */
export const formatFiltersForDisplay = (filters: AdvancedFiltersData | null): string[] => {
  const result: string[] = []

  if (!filters) return result

  if (filters.selectedPosition) {
    result.push(getEmployeePositionLabel(filters.selectedPosition))
  }

  if (filters.selectedCity) {
    result.push(filters.selectedCity)
  }

  if (filters.selectedSpecializations && filters.selectedSpecializations.length > 0) {
    result.push(...formatSpecializations(filters.selectedSpecializations))
  }

  return result
}

/**
 * Проверяет, есть ли активные фильтры
 */
export const hasActiveFilters = (filters: AdvancedFiltersData | null): boolean => {
  if (!filters) return false

  const hasPosition = filters.selectedPosition !== null && filters.selectedPosition !== undefined
  const hasCity =
    filters.selectedCity !== null &&
    filters.selectedCity !== undefined &&
    filters.selectedCity !== ''
  const hasSpecializations = (filters.selectedSpecializations?.length ?? 0) > 0
  return hasPosition || hasCity || hasSpecializations
}
