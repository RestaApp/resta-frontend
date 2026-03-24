import type { SupplierFilters } from './types'

/** Город для запроса: выбранный в фильтре или дефолт (город пользователя). */
export const resolveAppliedCity = (filters: SupplierFilters, defaultCity: string): string => {
  return (filters.city.trim() || defaultCity).trim()
}
