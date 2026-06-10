import { useMemo } from 'react'
import { getRestaurantProfile } from './mappers'
import { getSupplierProfile, getSupplierTypes } from '@/shared/utils/supplierProfile'
import {
  DEFAULT_SERVICE_CATEGORY_OPTIONS,
  DEFAULT_SUPPLIER_TYPES,
  SUPPLIER_TYPES_BY_CATEGORY,
  isSupplierCategory,
  type RestaurantApiUser,
  type SupplierApiUser,
  type SupplierFilters,
} from './types'

interface UseSuppliersFilterOptionsParams {
  isSupplierRole: boolean
  supplierUsers: SupplierApiUser[]
  restaurantUsers: RestaurantApiUser[]
  draftFilters: SupplierFilters
}

/**
 * Деривация опций для фильтр‑drawer’а:
 *  • supplierTypeOptions    — supplier‑side: дефолты + категории из API;
 *  • serviceCategoryOptions — supplier‑side, ограниченные выбранной категорией;
 *  • restaurantFormatOptions — restaurant‑side (для supplier‑role);
 *  • cuisineTypeOptions     — restaurant‑side (для supplier‑role).
 *
 * SRP: чистая трансформация ответа API в опции; никакого state/effects.
 */
export const useSuppliersFilterOptions = ({
  isSupplierRole,
  supplierUsers,
  restaurantUsers,
  draftFilters,
}: UseSuppliersFilterOptionsParams) => {
  const supplierTypeOptions = useMemo(() => {
    if (isSupplierRole) return []
    const fromApi = supplierUsers
      .map(item => {
        const profile = getSupplierProfile(item)
        return profile?.supplier_category ?? profile?.supplier_type ?? null
      })
      .filter((value): value is string => Boolean(value))
    return Array.from(new Set([...DEFAULT_SUPPLIER_TYPES, ...fromApi]))
  }, [isSupplierRole, supplierUsers])

  const allServiceCategoryOptions = useMemo(() => {
    if (isSupplierRole) return []
    const fromApi = supplierUsers.flatMap(item => getSupplierTypes(getSupplierProfile(item)))
    return Array.from(new Set([...DEFAULT_SERVICE_CATEGORY_OPTIONS, ...fromApi]))
  }, [isSupplierRole, supplierUsers])

  const serviceCategoryOptions = useMemo(() => {
    if (isSupplierRole) return []
    const selectedCategory = draftFilters.supplierType
    if (!selectedCategory || !isSupplierCategory(selectedCategory)) {
      return allServiceCategoryOptions
    }
    const validByCategory = new Set(SUPPLIER_TYPES_BY_CATEGORY[selectedCategory])
    return allServiceCategoryOptions.filter(option => validByCategory.has(option))
  }, [allServiceCategoryOptions, draftFilters.supplierType, isSupplierRole])

  const restaurantFormatOptions = useMemo(() => {
    if (!isSupplierRole) return []
    const fromApi = restaurantUsers
      .map(item => {
        const profile = getRestaurantProfile(item)
        return profile?.restaurant_format ?? profile?.format ?? null
      })
      .filter((value): value is string => Boolean(value))
    return Array.from(new Set(fromApi))
  }, [isSupplierRole, restaurantUsers])

  const cuisineTypeOptions = useMemo(() => {
    if (!isSupplierRole) return []
    const fromApi = restaurantUsers.flatMap(item => {
      const profile = getRestaurantProfile(item)
      const raw = profile?.cuisine_types
      return Array.isArray(raw) ? raw.filter((value): value is string => Boolean(value)) : []
    })
    return Array.from(new Set(fromApi))
  }, [isSupplierRole, restaurantUsers])

  return {
    supplierTypeOptions,
    serviceCategoryOptions,
    restaurantFormatOptions,
    cuisineTypeOptions,
  }
}
