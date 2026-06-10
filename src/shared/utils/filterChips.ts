import { MapPin } from 'lucide-react'
import type { ActiveFilterItem } from '@/shared/types/active-filters'

export const resolveFilterCity = (city: string): string => city.trim()

export const buildCityFilterChip = (city: string): ActiveFilterItem | null => {
  const normalized = resolveFilterCity(city)
  if (!normalized) return null

  return {
    id: 'city',
    label: normalized,
    icon: MapPin,
  }
}

export const removeFilterById = <TFilters extends Record<string, unknown>>(
  filters: TFilters,
  filterId: string,
  handlers: Record<string, (current: TFilters) => TFilters>
): TFilters => {
  const handler = handlers[filterId]
  return handler ? handler(filters) : filters
}
