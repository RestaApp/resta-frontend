/**
 * API для работы с пользователями
 * Содержит только определения endpoints (RTK Query)
 * Бизнес-логика вынесена в хуки
 */

import { api } from '@/shared/api/api'
import type { PaginationMeta } from '@/shared/api/pagination'
import type { UserData, WorkHistoryEntry } from './authApi'
import { createCatalogQuery, provideListTags } from './helpers'

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
    location?: string[] | null
    city?: string | null
    /** История работы employee — передаётся целиком (бэкенд заменяет поле полностью) */
    work_history?: WorkHistoryEntry[]
    /** Плоский формат employee (ROLES_FRONTEND_SPEC / API.md) */
    skills?: string[]
    experience_years?: number
    open_to_work?: boolean
    /** Плоский формат restaurant */
    restaurant_format?: string
    cuisine_types?: string[]
    website?: string | null
    business_hours?: Record<string, string> | null
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
      /** Ссылка на прайс-лист; на бэкенде принимается только nested */
      price_list_url?: string | null
      /** Устаревшее имя поля; предпочтительны supplier_category + supplier_types */
      supplier_type?: string
      name?: string
    }
    restaurant_profile_attributes?: {
      id?: number
      name?: string | null
      restaurant_format?: string
      cuisine_types?: string[]
      _destroy?: boolean
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
  meta?: {
    contact_access?: ContactAccessMeta
  }
}

export interface ContactAccessMeta {
  revealed: boolean
  reveals_remaining: number
  expires_at: string | null
}

export interface ContactRevealMeta {
  reveals_remaining: number
  expires_at: string | null
}

export interface RevealContactResponse {
  success: boolean
  data: UserData
  meta: ContactRevealMeta
}

/**
 * `user_type` для GET /api/v1/users (SEARCH_FILTERS_SPEC.md § Users).
 * Сотрудников можно запрашивать пачкой (`employees` / `employee`) или по должности (`chef`, `waiter`, …).
 */
export type UsersListType =
  | 'employees'
  | 'employee'
  | 'supplier'
  | 'restaurant'
  | 'chef'
  | 'waiter'
  | 'bartender'
  | 'barista'
  | 'hostess'
  | 'manager'
  | 'support'
  | 'delivery'
  | 'cashier'
  | 'office'

/**
 * Поддерживаемые query-параметры — см. SEARCH_FILTERS_SPEC.md.
 * Не использовать: `location`, `primary_role`, `min_rating`, `skills` (в текущем API не поддерживаются).
 */
export interface GetUsersParams {
  user_type: UsersListType
  city?: string
  specialization?: string
  min_experience?: number
  /** Для сотрудников; для ресторанов `false` на бэкенде может игнорироваться */
  open_to_work?: boolean
  supplier_category?: string
  /** Через запятую, при необходимости; требует `supplier_category` */
  supplier_types?: string
  delivery_available?: boolean
  page?: number
  per_page?: number
}

export interface GetUsersResponse {
  success: boolean
  data: UserData[]
  pagination?: PaginationMeta
  meta?: PaginationMeta
}

export const usersApi = api.injectEndpoints({
  endpoints: builder => ({
    // Получение данных пользователя
    getUser: builder.query<GetUserResponse, number>({
      query: id => ({
        url: `/api/v1/users/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
      keepUnusedDataFor: 300, // Кэшировать данные 5 минут
    }),

    revealContact: builder.mutation<RevealContactResponse, number>({
      query: id => ({
        url: `/api/v1/users/${id}/contacts/reveal`,
        method: 'POST',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled
          dispatch(
            usersApi.util.updateQueryData('getUser', id, draft => {
              draft.data = response.data
              draft.meta = {
                contact_access: {
                  revealed: true,
                  reveals_remaining: response.meta.reveals_remaining,
                  expires_at: response.meta.expires_at,
                },
              }
            })
          )
        } catch {
          // Ошибка обрабатывается вызывающим UI; кэш остаётся без изменений.
        }
      },
      invalidatesTags: (_result, _error, id) => [{ type: 'User', id }, 'Subscription'],
    }),

    // Получение списка пользователей по типу
    getUsers: builder.query<GetUsersResponse, GetUsersParams>({
      query: params => ({
        url: '/api/v1/users',
        method: 'GET',
        params,
      }),
      providesTags: result => provideListTags('User', result?.data),
      keepUnusedDataFor: 300,
    }),

    // Обновление данных пользователя
    updateUser: builder.mutation<UpdateUserResponse, { id: number; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled
          if (response.success && response.data) {
            dispatch(
              usersApi.util.updateQueryData('getUser', id, draft => {
                Object.assign(draft.data, response.data)
              })
            )
          }
        } catch {
          // on error — do nothing, UI shows error toast
        }
      },
    }),

    // Получение позиций (подролей сотрудников)
    getUserPositions: createCatalogQuery<UserPositionsResponse, void>(builder, {
      url: '/api/v1/catalogs/positions',
    }),

    // Получение специализаций для позиции
    getUserSpecializations: builder.query<UserSpecializationsResponse, string>({
      query: position => ({
        url: '/api/v1/catalogs/specializations',
        method: 'GET',
        params: { position },
      }),
      // Нормализуем аргумент для консистентного кеш-ключа,
      // чтобы "chef" и "Chef" не создавали два независимых entry.
      serializeQueryArgs: ({ queryArgs }) => {
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
  useRevealContactMutation,
  useUpdateUserMutation,
  useGetUserPositionsQuery,
  useGetUserSpecializationsQuery,
  useGetCitiesQuery,
} = usersApi
