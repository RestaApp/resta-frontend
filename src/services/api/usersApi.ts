/**
 * API для работы с пользователями
 * Содержит только определения endpoints (RTK Query)
 * Бизнес-логика вынесена в хуки
 */

import { api } from '@/shared/api/api'
import type { UserData } from './authApi'
import { createCatalogQuery } from './helpers'

export type { UserData } from './authApi'

/**
 * Запрос на обновление пользователя
 * Формат: { user: { role: "employee", position: "bartender" } }
 * Или: { user: { name: "Имя", last_name: "Фамилия" } }
 */
export interface UpdateUserRequest {
  user: {
    language?: string
    role?: string
    name?: string
    last_name?: string
    position?: string
    specialization?: string | null
    specializations?: string[]
    bio?: string | null
    email?: string | null
    phone?: string | null
    location?: string | null
    city?: string | null
    work_experience_summary?: string | null
    /** Простой формат (рекомендуется в API): см. PATCH /users/:id */
    supplier_category?: string
    supplier_types?: string[]
    delivery_available?: boolean
    employee_profile_attributes?: {
      id?: number
      experience_years?: number
      open_to_work?: boolean
      skills?: string[]
      position?: string
      specializations?: string[]
    }
    supplier_profile_attributes?: {
      supplier_category?: string
      supplier_types?: string[]
      delivery_available?: boolean
      /** Устаревшее имя поля; предпочтительны supplier_category + supplier_types */
      supplier_type?: string
      name?: string
    }
    restaurant_profile_attributes?: {
      restaurant_format?: string
      name?: string
    }
  }
}

/**
 * Ответ при обновлении пользователя
 */
export interface UpdateUserResponse {
  success: boolean
  data?: UserData
  errors?: string[]
}

/**
 * Ответ при получении позиций (подролей сотрудников)
 */
export interface UserPositionsResponse {
  success: boolean
  data: string[]
}

/**
 * Ответ при получении специализаций
 */
export interface UserSpecializationsResponse {
  success: boolean
  data: string[]
}

/**
 * Ответ при получении городов
 */
export interface CitiesResponse {
  success: boolean
  data: string[]
}

/**
 * Ответ при получении данных пользователя
 */
export interface GetUserResponse {
  success: boolean
  data: UserData
}

export type UsersListType = 'employees' | 'supplier' | 'restaurant'

export interface GetUsersParams {
  user_type: UsersListType
  city?: string
  location?: string
  /** Фильтр по должности (для employees) */
  position?: string
  /** Фильтр по специализации */
  specialization?: string
  /** Минимальный опыт работы (лет) */
  min_experience?: number
  /** Только для employee; для ресторанов false игнорируется на бэкенде */
  open_to_work?: boolean
  supplier_category?: string
  supplier_types?: string
  delivery_available?: boolean
  page?: number
  per_page?: number
}

export interface UsersPaginationMeta {
  current_page?: number
  next_page?: number | null
  prev_page?: number | null
  per_page?: number
  total_pages?: number
  total_count?: number
}

export interface GetUsersResponse {
  success: boolean
  data: UserData[]
  pagination?: UsersPaginationMeta
  meta?: UsersPaginationMeta
}

export const usersApi = api.injectEndpoints({
  endpoints: builder => ({
    // Получение данных пользователя
    getUser: builder.query<GetUserResponse, number>({
      query: id => ({
        url: `/api/v1/users/${id}`,
        method: 'GET',
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 300, // Кэшировать данные 5 минут
    }),

    // Получение списка пользователей по типу
    getUsers: builder.query<GetUsersResponse, GetUsersParams>({
      query: params => ({
        url: '/api/v1/users',
        method: 'GET',
        params,
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 60,
    }),

    // Обновление данных пользователя
    updateUser: builder.mutation<UpdateUserResponse, { id: number; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Получение позиций (подролей сотрудников)
    getUserPositions: createCatalogQuery<UserPositionsResponse, void>(builder, {
      url: '/api/v1/catalogs/positions',
    }),

    // Получение специализаций для позиции
    getUserSpecializations: builder.query<UserSpecializationsResponse, string>({
      query: position => ({
        url: `/api/v1/catalogs/specializations?position=${position}`,
        method: 'GET',
      }),
      // КРИТИЧНО: Нормализуем аргумент для корректного кеширования
      // Это гарантирует, что запросы для "chef" и "Chef" будут различаться
      serializeQueryArgs: ({ queryArgs }) => {
        // Нормализуем позицию к lowercase для консистентности
        return queryArgs.toLowerCase()
      },
      providesTags: (_result, _error, position) => [
        { type: 'Catalog' as const, id: `specializations-${position.toLowerCase()}` },
        'Catalog',
      ],
      keepUnusedDataFor: 3600, // Кэшировать данные 1 час
    }),

    // Получение городов
    getCities: createCatalogQuery<CitiesResponse, void>(builder, {
      url: '/api/v1/catalogs/cities',
    }),
  }),
})

// Экспорт базовых хуков RTK Query (используются в кастомных хуках)
export const {
  useGetUserQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useGetUserPositionsQuery,
  useGetUserSpecializationsQuery,
  useGetCitiesQuery,
} = usersApi
