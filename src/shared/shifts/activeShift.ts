import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { isEditableOwnerListing } from '@/shared/shifts/ownerShiftDisplay'

const INACTIVE_STATUSES = new Set(['completed', 'cancelled', 'canceled'])

/** Смена считается активной, если не завершена и end_time (или start_time) в будущем. */
const isActiveShift = (shift: VacancyApiItem, now = new Date()): boolean => {
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
  shifts.some(shift => isActiveShift(shift))

/**
 * Активная смена, которую ещё можно редактировать — по тем же правилам, что и на
 * экране деталей (`isEditableOwnerListing`): не filled/closed, срок не истёк, кандидат не выбран.
 */
export const findEditableEmployeeShift = (shifts: VacancyApiItem[]): VacancyApiItem | null =>
  shifts.find(shift => isActiveShift(shift) && isEditableOwnerListing(shift)) ?? null
