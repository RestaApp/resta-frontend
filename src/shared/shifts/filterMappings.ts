import { addDaysToISODate, getTodayDateISO } from '@/shared/utils/datetime'
import type { AdvancedFiltersData } from './types'
import type { DateFilterPreset, SalaryRangeId } from './filterConstants'
import { ALL_SALARY_RANGE_OPTIONS } from './filterConstants'

export const resolveSalaryRangeParams = (
  rangeId: SalaryRangeId | string | null | undefined
): { min_payment?: number; max_payment?: number } => {
  // Резолвим по объединённому списку: id уникальны для посменных и месячных диапазонов.
  const range = ALL_SALARY_RANGE_OPTIONS.find(item => item.id === rangeId)
  if (!range) return {}

  const params: { min_payment?: number; max_payment?: number } = { min_payment: range.min }
  if (range.max !== undefined) params.max_payment = range.max
  return params
}

const getEndOfWeekISO = (fromIso: string): string => {
  const date = new Date(`${fromIso}T00:00:00`)
  const dayOfWeek = date.getDay()
  const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  return addDaysToISODate(fromIso, daysToSunday)
}

export const resolveDateFilterParams = (
  filters: Pick<AdvancedFiltersData, 'selectedDatePreset' | 'customStartDate' | 'customEndDate'>
): { start_date?: string; end_date?: string } => {
  const preset = filters.selectedDatePreset
  if (!preset) return {}

  const today = getTodayDateISO()

  switch (preset as DateFilterPreset) {
    case 'today':
      return { start_date: today, end_date: today }
    case 'tomorrow': {
      const tomorrow = addDaysToISODate(today, 1)
      return { start_date: tomorrow, end_date: tomorrow }
    }
    case 'week':
      return { start_date: today, end_date: getEndOfWeekISO(today) }
    case 'custom': {
      const start = filters.customStartDate?.trim()
      if (!start) return {}
      const end = filters.customEndDate?.trim() || start
      return { start_date: start, end_date: end }
    }
    default:
      return {}
  }
}

export const hasActiveDateFilter = (
  filters: Pick<AdvancedFiltersData, 'selectedDatePreset' | 'customStartDate'>
): boolean => {
  const preset = filters.selectedDatePreset
  if (!preset) return false
  if (preset === 'custom') return Boolean(filters.customStartDate?.trim())
  return true
}
