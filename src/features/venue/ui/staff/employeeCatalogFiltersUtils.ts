import { Briefcase, Sparkles } from 'lucide-react'
import type { ActiveFilterItem } from '@/shared/types/active-filters'
import { buildCityFilterChip, resolveFilterCity } from '@/shared/utils/filterChips'
import type { EmployeeCatalogFilters } from './employeeCatalogTypes'

interface EmployeeFilterLabels {
  getEmployeePositionLabel: (value: string) => string
  getSpecializationLabel: (value: string) => string
}

export const resolveEmployeeCatalogCity = (filters: EmployeeCatalogFilters): string =>
  resolveFilterCity(filters.city)

export const formatEmployeeCatalogFiltersForDisplay = (
  filters: EmployeeCatalogFilters,
  labels: EmployeeFilterLabels
): ActiveFilterItem[] => {
  const result: ActiveFilterItem[] = []
  const cityChip = buildCityFilterChip(filters.city)
  if (cityChip) result.push(cityChip)

  if (filters.position) {
    result.push({
      id: 'position',
      label: labels.getEmployeePositionLabel(filters.position),
      icon: Briefcase,
      variant: 'primary',
    })
  }

  if (filters.specialization) {
    result.push({
      id: 'specialization',
      label: labels.getSpecializationLabel(filters.specialization),
      icon: Sparkles,
    })
  }

  return result
}

export const removeEmployeeCatalogFilter = (
  filters: EmployeeCatalogFilters,
  filterId: string
): EmployeeCatalogFilters => {
  if (filterId === 'city') return { ...filters, city: '' }
  if (filterId === 'position') return { ...filters, position: null, specialization: null }
  if (filterId === 'specialization') return { ...filters, specialization: null }
  return filters
}
