import type { UserData } from '@/services/api/usersApi'
import type { SupplierCardData } from '@/components/ui/shift-card/SupplierCard'

export type SupplierStatus = 'active' | 'paused'

export interface SupplierItem extends SupplierCardData {
  status: SupplierStatus
}

export type DeliveryFilter = 'all' | 'yes' | 'no'

export interface SupplierFilters {
  city: string
  supplierType: string | null
  serviceCategories: string[]
  delivery: DeliveryFilter
  restaurantFormats: string[]
  cuisineTypes: string[]
}

export interface SupplierProfile {
  supplier_type?: string | null
  supplier_category?: string | null
  supplier_types?: string[] | null
  name?: string | null
  delivery_available?: boolean | null
}

export interface SupplierApiUser extends UserData {
  supplier_profile?: SupplierProfile | null
  supplier_profile_attributes?: SupplierProfile | null
}

/** Профиль заведения в ответе API (роль supplier смотрит список ресторанов). */
export type RestaurantProfile = {
  restaurant_format?: string | null
  format?: string | null
  cuisine_types?: string[] | null
}

export type RestaurantApiUser = UserData & {
  restaurant_profile?: RestaurantProfile | null
  restaurant_profile_attributes?: RestaurantProfile | null
}

export type SupplierCategory = 'products' | 'equipment' | 'services' | 'logistics' | 'consumables'

export const DEFAULT_SUPPLIER_FILTERS: SupplierFilters = {
  city: '',
  supplierType: null,
  serviceCategories: [],
  delivery: 'all',
  restaurantFormats: [],
  cuisineTypes: [],
}

export const DEFAULT_SERVICE_CATEGORY_OPTIONS = [
  'produce_supplier',
  'meat_supplier',
  'seafood_supplier',
  'dairy_supplier',
  'bakery_supplier',
  'beverage_supplier',
  'alcohol_supplier',
  'kitchen_equipment_supplier',
  'furniture_supplier',
  'cleaning_service',
  'maintenance_service',
]

export const DEFAULT_SUPPLIER_TYPES = [
  'products',
  'equipment',
  'services',
  'logistics',
]

export const SUPPLIER_TYPES_BY_CATEGORY: Record<SupplierCategory, string[]> = {
  products: [
    'produce_supplier',
    'meat_supplier',
    'seafood_supplier',
    'dairy_supplier',
    'bakery_supplier',
    'beverage_supplier',
    'alcohol_supplier',
    'coffee_supplier',
  ],
  equipment: [
    'kitchen_equipment_supplier',
    'furniture_supplier',
    'tableware_supplier',
  ],
  // Legacy category, поддерживаем только для корректной фильтрации старых профилей.
  consumables: [
    'tableware_supplier',
    'cleaning_service',
  ],
  services: [
    'cleaning_service',
    'maintenance_service',
    'laundry_service',
    'waste_management',
    'pest_control',
    'accounting_service',
    'marketing_service',
    'staff_training',
    'consulting',
    'staffing_service',
  ],
  logistics: ['delivery_service', 'logistics_provider'],
}

export const isSupplierCategory = (value: string): value is SupplierCategory =>
  value in SUPPLIER_TYPES_BY_CATEGORY

export const getValidSupplierTypesForCategory = (
  category: string | null | undefined,
  supplierTypes: string[]
): string[] => {
  if (!category || !isSupplierCategory(category)) return []
  const validTypes = new Set(SUPPLIER_TYPES_BY_CATEGORY[category])
  return supplierTypes.filter(type => validTypes.has(type))
}

export const SUPPLIERS_PER_PAGE = 10
