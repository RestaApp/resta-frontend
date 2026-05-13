/**
 * Утилиты для работы с фильтрами
 */

import type { AdvancedFiltersData } from '@/features/feed/ui/components/AdvancedFilters'
import { parseDate } from './datetime'
import i18n from '@/shared/i18n/config'

/**
 * Форматирует дату для отображения в фильтрах
 */
const formatFilterDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return ''
  const date = parseDate(dateStr)
  if (!date) return dateStr
  const locale = i18n.language === 'en' ? 'en-US' : 'ru-RU'
  return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })
}

/**
 * Форматирует диапазон дат для отображения
 */
const formatDateRange = (
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string | null => {
  if (startDate && endDate) {
    return `${formatFilterDate(startDate)}-${formatFilterDate(endDate)}`
  }
  if (startDate) {
    return i18n.t('filters.fromDate', { date: formatFilterDate(startDate) })
  }
  if (endDate) {
    return i18n.t('filters.toDate', { date: formatFilterDate(endDate) })
  }
  return null
}

const getSpecializationLabel = (spec: string): string =>
  i18n.t(`labels.specialization.${spec}`) || spec
const getEmployeePositionLabel = (value: string): string =>
  i18n.t(`labels.position.${value}`) || i18n.t(`labels.position.${value.toLowerCase()}`) || value

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
 * Преобразует фильтры в список строк для отображения
 */
export const formatFiltersForDisplay = (filters: AdvancedFiltersData | null): string[] => {
  const result: string[] = []

  if (!filters) return result

  if (filters.whenPreset) {
    result.push(i18n.t(`feed.whenPreset.${filters.whenPreset}`))
  }

  if (filters.selectedPosition) {
    result.push(getEmployeePositionLabel(filters.selectedPosition))
  }

  if (filters.selectedCity) {
    result.push(filters.selectedCity)
  }

  if (
    filters.geoLat != null &&
    filters.geoLon != null &&
    typeof filters.radiusKm === 'number' &&
    Number.isFinite(filters.radiusKm)
  ) {
    result.push(i18n.t('feed.filterRadiusSummary', { km: filters.radiusKm }))
  }

  if (filters.selectedSpecializations && filters.selectedSpecializations.length > 0) {
    result.push(...formatSpecializations(filters.selectedSpecializations))
  }

  if (!filters.whenPreset) {
    const dateRange = formatDateRange(filters.startDate, filters.endDate)
    if (dateRange) {
      result.push(dateRange)
    }
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
  const hasDates = filters.startDate !== null || filters.endDate !== null
  const hasWhenPreset = Boolean(filters.whenPreset)
  const hasGeo =
    filters.geoLat != null &&
    filters.geoLon != null &&
    Number.isFinite(filters.geoLat) &&
    Number.isFinite(filters.geoLon)

  return hasPosition || hasCity || hasSpecializations || hasDates || hasWhenPreset || hasGeo
}
