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

export type SupplierCategory = 'products' | 'equipment' | 'consumables' | 'services' | 'logistics'

export const DEFAULT_SUPPLIER_FILTERS: SupplierFilters = {
  city: '',
  supplierType: null,
  serviceCategories: [],
  delivery: 'all',
  restaurantFormats: [],
  cuisineTypes: [],
}

export const DEFAULT_SERVICE_CATEGORY_OPTIONS = [
  'meat',
  'seafood',
  'produce',
  'dairy',
  'bakery',
  'beverages',
  'alcohol',
  'kitchen_equipment',
  'furniture',
  'cleaning',
  'maintenance',
]

export const DEFAULT_SUPPLIER_TYPES = [
  'products',
  'equipment',
  'consumables',
  'services',
  'logistics',
]

export const SUPPLIER_TYPES_BY_CATEGORY: Record<SupplierCategory, string[]> = {
  products: [
    'vegetables',
    'fruits',
    'berries',
    'greens',
    'microgreens',
    'meat',
    'poultry',
    'seafood',
    'dairy',
    'bakery',
    'grocery',
    'frozen_food',
    'beverages',
    'coffee',
    'tea',
    'alcohol',
    'bar_ingredients',
    'confectionery_ingredients',
  ],
  equipment: [
    'kitchen_equipment',
    'refrigeration',
    'coffee_equipment',
    'bar_equipment',
    'bakery_equipment',
    'furniture',
    'tableware',
    'kitchen_inventory',
  ],
  consumables: [
    'food_packaging',
    'disposable_tableware',
    'hygiene_products',
    'professional_chemicals',
    'cleaning_inventory',
    'paper_products',
    'kitchen_consumables',
  ],
  services: [
    'cleaning',
    'maintenance',
    'equipment_repair',
    'laundry',
    'waste_management',
    'pest_control',
    'accounting',
    'marketing',
    'staff_training',
    'uniform_tailoring',
    'consulting',
    'automation',
    'design_and_projecting',
  ],
  logistics: ['delivery', 'cold_chain_delivery', 'logistics_provider', 'warehousing'],
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
