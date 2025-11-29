/**
 * API для работы с пользователями
 * Содержит только определения endpoints (RTK Query)
 * Бизнес-логика вынесена в хуки
 */

import { api } from '../../store/api'
import type { UserData } from './authApi'

/**
 * Запрос на обновление пользователя
 */
export interface UpdateUserRequest {
  role?: string
  position?: string
  [key: string]: unknown
}

/**
 * Ответ при обновлении пользователя
 */
export interface UpdateUserResponse {
  success: boolean
  data: UserData
}

/**
 * Позиция (подроль) из API
 */
export interface PositionApiItem {
  value: string
  label: string
}

/**
 * Ответ при получении позиций (подролей сотрудников)
 */
export interface UserPositionsResponse {
  success: boolean
  data: PositionApiItem[]
}

export const usersApi = api.injectEndpoints({
  endpoints: builder => ({
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
    getUserPositions: builder.query<UserPositionsResponse, void>({
      query: () => ({
        url: '/api/v1/users/positions',
        method: 'GET',
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 300, // Кэшировать данные 5 минут
    }),
  }),
})

// Экспорт базовых хуков RTK Query (используются в кастомных хуках)
export const { useUpdateUserMutation, useGetUserPositionsQuery } = usersApi

