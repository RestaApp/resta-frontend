/**
 * Утилиты для работы с фильтрами
 */

import type { AdvancedFiltersData } from '@/features/feed/ui/components/AdvancedFilters'
import type { QuickFilter } from '@/features/feed/model/utils/clientFilters'

export const DEFAULT_PRICE_RANGE: [number, number] = [0, 1000]
export const DEFAULT_JOBS_PRICE_RANGE: [number, number] = [0, 5000]

/**
 * Проверяет, является ли диапазон цен значением по умолчанию
 */
const isDefaultPriceRange = (priceRange: [number, number]): boolean => {
  return priceRange[0] === DEFAULT_PRICE_RANGE[0] && priceRange[1] === DEFAULT_PRICE_RANGE[1]
}

import { parseDate } from './datetime'
import i18n from '@/shared/i18n/config'
import { formatMoney } from '@/features/feed/model/utils/formatting'

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

/**
 * Форматирует специализации для отображения
 * Показывает первые 2, остальные как "+N"
 */
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

const QUICK_FILTER_LABELS: Record<Exclude<QuickFilter, 'all'>, { ru: string; en: string }> = {
  urgent: { ru: '🔥 Срочные', en: '🔥 Urgent' },
  high_pay: { ru: '💰 Высокая оплата', en: '💰 High pay' },
  nearby: { ru: '📍 Рядом', en: '📍 Nearby' },
  my_role: { ru: '🧑‍🍳 Моя роль', en: '🧑‍🍳 My role' },
}

const getQuickFilterLabel = (value: QuickFilter): string | null => {
  if (value === 'all') return null
  const label = QUICK_FILTER_LABELS[value]
  if (!label) return value
  return i18n.language === 'en' ? label.en : label.ru
}

/**
 * Преобразует фильтры в список строк для отображения
 */
export const formatFiltersForDisplay = (
  filters: AdvancedFiltersData | null,
  quickFilter?: QuickFilter
): string[] => {
  const result: string[] = []

  if (quickFilter) {
    const quickLabel = getQuickFilterLabel(quickFilter)
    if (quickLabel) result.push(quickLabel)
  }

  if (!filters) return result

  // Позиция
  if (filters.selectedPosition) {
    result.push(getEmployeePositionLabel(filters.selectedPosition))
  }

  // Город
  if (filters.selectedCity) {
    result.push(filters.selectedCity)
  }

  // Специализации
  if (filters.selectedSpecializations && filters.selectedSpecializations.length > 0) {
    result.push(...formatSpecializations(filters.selectedSpecializations))
  }

  // Диапазон цен (если не по умолчанию и не null)
  if (filters.priceRange && !isDefaultPriceRange(filters.priceRange)) {
    result.push(`${formatMoney(filters.priceRange[0])}-${formatMoney(filters.priceRange[1])} BYN`)
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

  const hasNonDefaultPrice = filters.priceRange !== null && !isDefaultPriceRange(filters.priceRange)
  const hasPosition = filters.selectedPosition !== null && filters.selectedPosition !== undefined
  const hasCity =
    filters.selectedCity !== null &&
    filters.selectedCity !== undefined &&
    filters.selectedCity !== ''
  const hasSpecializations = (filters.selectedSpecializations?.length ?? 0) > 0
  const hasDates = filters.startDate !== null || filters.endDate !== null

  return hasNonDefaultPrice || hasPosition || hasCity || hasSpecializations || hasDates
}
