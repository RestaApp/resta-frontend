/**
 * API для работы с ролями пользователей
 */

import { api } from '../../store/api'

/**
 * Роль из API
 */
export interface RoleApiItem {
  value: string
  label: string
}

/**
 * Ответ API с доступными ролями
 */
export interface AvailableUserRolesResponse {
  success: boolean
  data: RoleApiItem[]
}

/**
 * Ответ API с типами поставщиков
 */
export interface SupplierTypesResponse {
  data: RoleApiItem[]
}

/**
 * Ответ API с форматами ресторанов
 */
export interface RestaurantFormatsResponse {
  data: RoleApiItem[]
}

export const rolesApi = api.injectEndpoints({
  endpoints: builder => ({
    // Получить список доступных ролей для страницы выбора роли
    // Используется только в компоненте RoleSelector
    getAvailableUserRoles: builder.query<AvailableUserRolesResponse, void>({
      query: () => ({
        url: '/api/v1/users/available_user_roles',
        method: 'GET',
      }),
      providesTags: ['User'],
      // Настройки кэширования
      keepUnusedDataFor: 300, // Кэшировать данные 5 минут
      // refetchOnMountOrArgChange, refetchOnFocus, refetchOnReconnect управляются на уровне хука
    }),

    // Получить список типов поставщиков
    getSupplierTypes: builder.query<SupplierTypesResponse, void>({
      query: () => ({
        url: '/api/v1/users/supplier_types',
        method: 'GET',
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 300, // Кэшировать данные 5 минут
    }),

    // Получить список форматов ресторанов
    getRestaurantFormats: builder.query<RestaurantFormatsResponse, void>({
      query: () => ({
        url: '/api/v1/users/restaurant_formats',
        method: 'GET',
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 300, // Кэшировать данные 5 минут
    }),
  }),
})

// Экспорт хуков для использования в компонентах
export const { useGetAvailableUserRolesQuery, useGetSupplierTypesQuery, useGetRestaurantFormatsQuery } = rolesApi
