/**
 * Утилиты для работы с фильтрами
 */

import { Calendar, MapPin, Tags, Wallet } from 'lucide-react'
import type { AdvancedFiltersData } from '@/shared/shifts/types'
import type { ActiveFilterItem } from '@/shared/types/active-filters'
import type { EmployeeRole } from '@/shared/types/roles.types'
import i18n from '@/shared/i18n/config'
import { getEmployeeRoleIcon } from '@/shared/constants/role-icons'
import { normalizeCatalogPosition } from '@/shared/utils/roles'
import { hasActiveDateFilter } from '@/shared/shifts/filterMappings'

const getSpecializationLabel = (spec: string): string =>
  i18n.t(`labels.specialization.${spec}`) || spec

const formatIsoDateLabel = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' }).format(date)
}
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
    selectedSalaryRange: filters.selectedSalaryRange || undefined,
    selectedDatePreset: filters.selectedDatePreset || undefined,
    customStartDate: filters.customStartDate?.trim() || undefined,
    customEndDate: filters.customEndDate?.trim() || undefined,
  }

  if (normalized.selectedDatePreset === 'custom' && !normalized.customStartDate) {
    normalized.selectedDatePreset = undefined
    normalized.customEndDate = undefined
  }

  if (!hasActiveDateFilter(normalized)) {
    normalized.selectedDatePreset = undefined
    normalized.customStartDate = undefined
    normalized.customEndDate = undefined
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

  if (filters.selectedSalaryRange) {
    result.push({
      id: 'salary',
      label: i18n.t(`feed.salaryRange.${filters.selectedSalaryRange}`),
      icon: Wallet,
    })
  }

  if (hasActiveDateFilter(filters)) {
    const preset = filters.selectedDatePreset
    const label =
      preset === 'custom' && filters.customStartDate
        ? filters.customEndDate && filters.customEndDate !== filters.customStartDate
          ? `${formatIsoDateLabel(filters.customStartDate)} – ${formatIsoDateLabel(filters.customEndDate)}`
          : formatIsoDateLabel(filters.customStartDate)
        : preset
          ? i18n.t(`feed.whenPreset.${preset}`)
          : ''
    if (label) {
      result.push({
        id: 'date',
        label,
        icon: Calendar,
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
  } else if (filterId === 'salary') {
    next.selectedSalaryRange = undefined
  } else if (filterId === 'date') {
    next.selectedDatePreset = undefined
    next.customStartDate = undefined
    next.customEndDate = undefined
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
  const hasSalary = Boolean(filters.selectedSalaryRange)
  const hasDate = hasActiveDateFilter(filters)
  return hasPosition || hasCity || hasSpecializations || hasSalary || hasDate
}
