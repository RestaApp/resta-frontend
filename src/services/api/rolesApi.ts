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
  }),
})

// Экспорт хуков для использования в компонентах
export const { useGetAvailableUserRolesQuery } = rolesApi
