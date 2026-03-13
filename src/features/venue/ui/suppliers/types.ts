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

export const DEFAULT_SUPPLIER_FILTERS: SupplierFilters = {
  city: '',
  supplierType: null,
  serviceCategories: [],
  delivery: 'all',
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

export const DEFAULT_SUPPLIER_TYPES = ['products', 'equipment', 'services']

export const SUPPLIERS_PER_PAGE = 10
