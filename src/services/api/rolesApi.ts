/**
 * API для работы с ролями пользователей
 */

import { api } from '@/shared/api/api'
import { createCatalogQuery } from './helpers'

/**
 * Ответ API с доступными ролями
 */
export interface AvailableUiRolesResponse {
  success: boolean
  data: string[]
}

/**
 * Ответ API с типами поставщиков
 */
export interface SupplierTypesResponse {
  data: string[]
}

/**
 * Ответ API с форматами ресторанов
 */
export interface RestaurantFormatsResponse {
  data: string[]
}

export const rolesApi = api.injectEndpoints({
  endpoints: builder => ({
    // Получить список доступных ролей для страницы выбора роли
    // Используется только в компоненте RoleSelector
    getAvailableUiRoles: createCatalogQuery<AvailableUiRolesResponse, void>(builder, {
      url: '/api/v1/catalogs/roles',
    }),

    // Получить список типов поставщиков
    getSupplierTypes: createCatalogQuery<SupplierTypesResponse, void>(builder, {
      url: '/api/v1/catalogs/supplier_types',
    }),

    // Получить список форматов ресторанов
    getRestaurantFormats: createCatalogQuery<RestaurantFormatsResponse, void>(builder, {
      url: '/api/v1/catalogs/restaurant_formats',
    }),
  }),
})

// Экспорт хуков для использования в компонентах
export const {
  useGetAvailableUiRolesQuery,
  useGetSupplierTypesQuery,
  useGetRestaurantFormatsQuery,
} = rolesApi
