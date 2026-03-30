/**
 * API для работы с ролями пользователей
 */

import { api } from '@/shared/api/api'
import { CATALOG_ENDPOINT_CONFIG, createCatalogQuery } from './helpers'

/**
 * Ответ API с доступными ролями
 */
export interface AvailableUiRolesResponse {
  success: boolean
  data: string[]
}

/**
 * GET /api/v1/catalogs/supplier_categories
 */
export interface SupplierCategoriesResponse {
  success?: boolean
  data: string[]
}

/**
 * Ответ API с типами поставщиков
 * GET /api/v1/catalogs/supplier_types?supplier_category=...
 */
export interface SupplierTypesResponse {
  success?: boolean
  data: string[]
}

/**
 * Ответ API с форматами ресторанов
 */
export interface RestaurantFormatsResponse {
  data: string[]
}

/**
 * GET /api/v1/catalogs/cuisine_types
 */
export interface CuisineTypesResponse {
  success: boolean
  data: string[]
}

export const rolesApi = api.injectEndpoints({
  endpoints: builder => ({
    // Получить список доступных ролей для страницы выбора роли
    // Используется только в компоненте RoleSelector
    getAvailableUiRoles: createCatalogQuery<AvailableUiRolesResponse, void>(builder, {
      url: '/api/v1/catalogs/roles',
    }),

    getSupplierCategories: createCatalogQuery<SupplierCategoriesResponse, void>(builder, {
      url: '/api/v1/catalogs/supplier_categories',
    }),

    // Типы поставщиков по категории (supplier_category обязателен в API)
    getSupplierTypes: builder.query<SupplierTypesResponse, string>({
      query: supplierCategory => ({
        url: '/api/v1/catalogs/supplier_types',
        params: { supplier_category: supplierCategory },
      }),
      ...CATALOG_ENDPOINT_CONFIG,
    }),

    // Получить список форматов ресторанов
    getRestaurantFormats: createCatalogQuery<RestaurantFormatsResponse, void>(builder, {
      url: '/api/v1/catalogs/restaurant_formats',
    }),

    getCuisineTypes: createCatalogQuery<CuisineTypesResponse, void>(builder, {
      url: '/api/v1/catalogs/cuisine_types',
    }),
  }),
})

// Экспорт хуков для использования в компонентах
export const {
  useGetAvailableUiRolesQuery,
  useGetSupplierCategoriesQuery,
  useGetSupplierTypesQuery,
  useGetRestaurantFormatsQuery,
  useGetCuisineTypesQuery,
} = rolesApi
