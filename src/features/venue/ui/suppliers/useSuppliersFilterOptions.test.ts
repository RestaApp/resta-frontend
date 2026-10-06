import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSuppliersFilterOptions } from './useSuppliersFilterOptions'
import {
  DEFAULT_SERVICE_CATEGORY_OPTIONS,
  DEFAULT_SUPPLIER_FILTERS,
  DEFAULT_SUPPLIER_TYPES,
  SUPPLIER_TYPES_BY_CATEGORY,
  getValidSupplierTypesForCategory,
  type SupplierApiUser,
} from './types'

/**
 * Ожидаемый каталог — копия `SUPPLIER_CATEGORIES` из бэкенда
 * (`resta_backend/app/lib/role_catalog.rb`). При изменении каталога на бэке
 * обновить здесь и в `types.ts` синхронно: бэкенд валидирует `supplier_types`
 * по этому списку, а фильтр отбрасывает всё, чего в нём нет.
 */
const BACKEND_SUPPLIER_CATEGORIES: Record<string, string[]> = {
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

const makeSupplier = (
  id: number,
  supplier_category: string,
  supplier_types: string[]
): SupplierApiUser =>
  ({
    id,
    supplier_profile: { supplier_category, supplier_types },
  }) as unknown as SupplierApiUser

const renderOptions = (supplierUsers: SupplierApiUser[], supplierType: string | null) =>
  renderHook(() =>
    useSuppliersFilterOptions({
      isSupplierRole: false,
      supplierUsers,
      restaurantUsers: [],
      draftFilters: { ...DEFAULT_SUPPLIER_FILTERS, supplierType },
    })
  ).result.current

describe('каталог типов поставщика (зеркало role_catalog.rb)', () => {
  it('категории и типы совпадают с бэкендом один в один (ключи, коды, порядок)', () => {
    expect(SUPPLIER_TYPES_BY_CATEGORY).toEqual(BACKEND_SUPPLIER_CATEGORIES)
    expect(DEFAULT_SUPPLIER_TYPES).toEqual(Object.keys(BACKEND_SUPPLIER_CATEGORIES))
    expect(DEFAULT_SERVICE_CATEGORY_OPTIONS).toEqual(
      Object.values(BACKEND_SUPPLIER_CATEGORIES).flat()
    )
  })

  it('не содержит устаревших кодов вида *_supplier / *_service', () => {
    const legacy = DEFAULT_SERVICE_CATEGORY_OPTIONS.filter(code =>
      /_supplier$|_service$/.test(code)
    )
    expect(legacy).toEqual([])
  })

  it('getValidSupplierTypesForCategory оставляет только типы выбранной категории', () => {
    expect(
      getValidSupplierTypesForCategory('products', ['meat', 'cleaning', 'delivery', 'unknown'])
    ).toEqual(['meat'])
    expect(getValidSupplierTypesForCategory('legacy_category', ['meat'])).toEqual([])
    expect(getValidSupplierTypesForCategory(null, ['meat'])).toEqual([])
  })
})

describe('useSuppliersFilterOptions', () => {
  it('без выбранной категории показывает все категории и все типы', () => {
    const options = renderOptions([], null)
    expect(options.supplierTypeOptions).toEqual(DEFAULT_SUPPLIER_TYPES)
    expect(options.serviceCategoryOptions).toEqual(DEFAULT_SERVICE_CATEGORY_OPTIONS)
  })

  it.each(Object.keys(BACKEND_SUPPLIER_CATEGORIES))(
    'с выбранной категорией %s типы ограничены её списком из бэкенда',
    category => {
      const options = renderOptions([], category)
      expect(options.serviceCategoryOptions).toEqual(BACKEND_SUPPLIER_CATEGORIES[category])
    }
  )

  it('типы из API, отсутствующие в каталоге, не попадают в опции выбранной категории', () => {
    const users = [makeSupplier(1, 'products', ['meat', 'produce_supplier'])]
    const options = renderOptions(users, 'products')
    expect(options.serviceCategoryOptions).toContain('meat')
    expect(options.serviceCategoryOptions).not.toContain('produce_supplier')
    // Без категории API-значение всё же видно — чтобы фильтр не терял данные старых профилей.
    expect(renderOptions(users, null).serviceCategoryOptions).toContain('produce_supplier')
  })
})
