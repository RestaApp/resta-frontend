import type { VacancyApiItem } from '@/services/api/shiftsApi'

const INACTIVE_STATUSES = new Set(['completed', 'cancelled', 'canceled'])

/** Смена считается активной, если не завершена и end_time (или start_time) в будущем. */
export const isActiveShift = (shift: VacancyApiItem, now = new Date()): boolean => {
  const status = shift.status?.trim().toLowerCase()
  if (status && INACTIVE_STATUSES.has(status)) return false

  if (!shift.start_time) return true

  try {
    if (shift.end_time) {
      return new Date(shift.end_time) >= now
    }
    return new Date(shift.start_time) >= now
  } catch {
    return true
  }
}

/** Сотрудник может создать только одну активную смену. */
export const hasActiveEmployeeShift = (shifts: VacancyApiItem[]): boolean =>
  shifts.some(isActiveShift)
