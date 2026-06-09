/**
 * Утилиты для работы с фильтрами
 */

import { MapPin, Tags } from 'lucide-react'
import type { AdvancedFiltersData } from '@/shared/shifts/types'
import type { ActiveFilterItem } from '@/shared/types/active-filters'
import type { EmployeeRole } from '@/shared/types/roles.types'
import i18n from '@/shared/i18n/config'
import { getEmployeeRoleIcon } from '@/shared/constants/role-icons'
import { normalizeCatalogPosition } from '@/shared/utils/roles'

const getSpecializationLabel = (spec: string): string =>
  i18n.t(`labels.specialization.${spec}`) || spec
const getEmployeePositionLabel = (value: string): string => {
  const positionKey = normalizeCatalogPosition(value)
  return i18n.t(`labels.position.${positionKey}`) || value
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
 * Преобразует фильтры в список чипов для отображения
 */
export const formatFiltersForDisplay = (
  filters: AdvancedFiltersData | null
): ActiveFilterItem[] => {
  const result: ActiveFilterItem[] = []

  if (!filters) return result

  if (filters.selectedPosition) {
    const positionKey = normalizeCatalogPosition(filters.selectedPosition)
    result.push({
      id: 'position',
      label: getEmployeePositionLabel(filters.selectedPosition),
      icon: getEmployeeRoleIcon(positionKey as EmployeeRole),
      variant: 'primary',
    })
  }

  if (filters.selectedCity) {
    result.push({
      id: 'city',
      label: filters.selectedCity,
      icon: MapPin,
    })
  }

  if (filters.selectedSpecializations?.length) {
    for (const specialization of filters.selectedSpecializations) {
      result.push({
        id: `specialization:${specialization}`,
        label: getSpecializationLabel(specialization),
        icon: Tags,
      })
    }
  }

  return result
}

/**
 * Убирает один активный фильтр из набора
 */
export const removeAdvancedFilter = (
  filters: AdvancedFiltersData,
  filterId: string
): AdvancedFiltersData | null => {
  const next: AdvancedFiltersData = { ...filters }

  if (filterId === 'position') {
    next.selectedPosition = undefined
    next.selectedSpecializations = undefined
  } else if (filterId === 'city') {
    next.selectedCity = undefined
  } else if (filterId.startsWith('specialization:')) {
    const specialization = filterId.slice('specialization:'.length)
    const remaining = next.selectedSpecializations?.filter(item => item !== specialization)
    next.selectedSpecializations = remaining?.length ? remaining : undefined
  }

  return normalizeAdvancedFilters(next)
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
