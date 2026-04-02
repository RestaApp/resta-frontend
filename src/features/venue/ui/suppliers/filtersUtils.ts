import type { SupplierFilters } from './types'

/** Город для запроса: только явно выбранный в фильтре. */
export const resolveAppliedCity = (filters: SupplierFilters): string => {
  return filters.city.trim()
}
