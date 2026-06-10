import { CheckCircle2, MapPin, Package, Store, Truck, UtensilsCrossed } from 'lucide-react'
import type { ActiveFilterItem } from '@/shared/types/active-filters'
import { getSupplierCategoryIcon } from '@/shared/constants/role-icons'
import type { SupplierFilters } from './types'
import { getValidSupplierTypesForCategory } from './types'

/** Город для запроса: только явно выбранный в фильтре. */
export const resolveAppliedCity = (filters: SupplierFilters): string => {
  return filters.city.trim()
}

interface SupplierFilterLabels {
  getRestaurantFormatLabel: (value: string) => string
  getCuisineTypeLabel: (value: string) => string
  getSupplierTypeLabel: (value: string) => string
  deliveryYes: string
  deliveryNo: string
  onlyActive: string
}

export const formatSupplierFiltersForDisplay = (
  filters: SupplierFilters,
  labels: SupplierFilterLabels,
  isSupplierRole: boolean
): ActiveFilterItem[] => {
  const result: ActiveFilterItem[] = []
  const city = resolveAppliedCity(filters)

  if (city) {
    result.push({
      id: 'city',
      label: city,
      icon: MapPin,
    })
  }

  if (isSupplierRole) {
    for (const format of filters.restaurantFormats) {
      result.push({
        id: `restaurantFormat:${format}`,
        label: labels.getRestaurantFormatLabel(format),
        icon: Store,
      })
    }

    for (const cuisine of filters.cuisineTypes) {
      result.push({
        id: `cuisine:${cuisine}`,
        label: labels.getCuisineTypeLabel(cuisine),
        icon: UtensilsCrossed,
      })
    }

    return result
  }

  if (filters.supplierType) {
    result.push({
      id: 'supplierType',
      label: labels.getSupplierTypeLabel(filters.supplierType),
      icon: Truck,
      variant: 'primary',
    })
  }

  const validSupplierTypes = filters.supplierType
    ? getValidSupplierTypesForCategory(filters.supplierType, filters.serviceCategories)
    : []

  for (const category of validSupplierTypes) {
    result.push({
      id: `serviceCategory:${category}`,
      label: labels.getSupplierTypeLabel(category),
      icon: getSupplierCategoryIcon(category),
    })
  }

  if (filters.delivery === 'yes') {
    result.push({
      id: 'delivery',
      label: labels.deliveryYes,
      icon: Package,
    })
  } else if (filters.delivery === 'no') {
    result.push({
      id: 'delivery',
      label: labels.deliveryNo,
      icon: Package,
    })
  }

  if (filters.onlyActive) {
    result.push({
      id: 'onlyActive',
      label: labels.onlyActive,
      icon: CheckCircle2,
    })
  }

  return result
}

export const removeSupplierFilter = (
  filters: SupplierFilters,
  filterId: string
): SupplierFilters => {
  const next: SupplierFilters = {
    ...filters,
    serviceCategories: [...filters.serviceCategories],
    restaurantFormats: [...filters.restaurantFormats],
    cuisineTypes: [...filters.cuisineTypes],
  }

  if (filterId === 'city') {
    next.city = ''
  } else if (filterId === 'supplierType') {
    next.supplierType = null
    next.serviceCategories = []
  } else if (filterId.startsWith('serviceCategory:')) {
    const category = filterId.slice('serviceCategory:'.length)
    next.serviceCategories = next.serviceCategories.filter(item => item !== category)
  } else if (filterId.startsWith('restaurantFormat:')) {
    const format = filterId.slice('restaurantFormat:'.length)
    next.restaurantFormats = next.restaurantFormats.filter(item => item !== format)
  } else if (filterId.startsWith('cuisine:')) {
    const cuisine = filterId.slice('cuisine:'.length)
    next.cuisineTypes = next.cuisineTypes.filter(item => item !== cuisine)
  } else if (filterId === 'delivery') {
    next.delivery = 'all'
  } else if (filterId === 'onlyActive') {
    next.onlyActive = false
  }

  return next
}
