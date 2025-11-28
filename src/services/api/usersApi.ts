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
  [key: string]: unknown
}

/**
 * Ответ при обновлении пользователя
 */
export interface UpdateUserResponse {
  success: boolean
  data: UserData
}

export const usersApi = api.injectEndpoints({
  endpoints: builder => ({
    // Обновление данных пользователя
    updateUser: builder.mutation<UpdateUserResponse, { id: number; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

// Экспорт базовых хуков RTK Query (используются в кастомных хуках)
export const { useUpdateUserMutation } = usersApi

