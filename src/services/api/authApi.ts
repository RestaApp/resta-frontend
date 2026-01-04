/**
 * API для авторизации через Telegram
 * Содержит только определения endpoints (RTK Query)
 * Бизнес-логика вынесена в хуки
 */

import { api } from '@/store/api'
import { authService } from '@/services/auth'

export interface TelegramAuthRequest {
  initData: string
}

export interface EmployeeProfile {
  experience_years: number
  open_to_work: boolean
  position: string
  skills: string[]
  specializations: string[]
}

export interface UserData {
  id: number
  active: boolean
  average_rating: number
  bio: string | null
  certifications?: string[]
  created_at: string
  email: string | null
  employee_profile: EmployeeProfile | null
  full_name: string
  language: string
  last_name: string
  location: string | null
  name: string
  phone: string | null
  photo_url: string | null
  profile_complete: boolean
  profile_photo_url: string | null
  role: string
  telegram_id: number
  total_reviews: number
  updated_at: string
  username: string
  website: string | null
  work_experience_summary: string | null
  work_preferences: Record<string, unknown>
  // Опциональные поля, которые могут отсутствовать в ответе
  available_for_work?: boolean
  experience_years?: number
  position?: string
  service_categories?: unknown[]
  service_categories_list?: string | null
  specialization?: string | null
}

export interface SignInResponse {
  success: boolean
  data: {
    id: number
    role: string
  }
  meta: {
    token: string
  }
}

export interface AuthResponse {
  success: boolean
  data: UserData
  meta: {
    token: string
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface UpdateRoleRequest {
  role: string
  position?: string
}

export interface UpdateRoleResponse {
  success: boolean
  data: UserData
}

export const authApi = api.injectEndpoints({
  endpoints: builder => ({
    // Авторизация через Telegram
    authTelegram: builder.mutation<SignInResponse, TelegramAuthRequest>({
      query: body => ({
        url: '/api/v1/auth/sign_in',
        method: 'POST',
        body,
      }),
      // Не инвалидируем теги 'User' при sign_in, чтобы избежать лишнего refetch
      // (userData обновляется вручную в хуке authTelegram)
    }),

    // Обновление JWT токена
    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => {
        const refreshToken = authService.getRefreshToken()
        if (!refreshToken) {
          throw new Error('Refresh token не найден')
        }
        return {
          url: '/api/v1/auth/refresh',
          method: 'POST',
          body: { refreshToken } as RefreshTokenRequest,
        }
      },
    }),

    // Обновление роли пользователя
    updateRole: builder.mutation<UpdateRoleResponse, UpdateRoleRequest>({
      query: body => ({
        url: '/api/v1/auth/sign_in',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

// Экспорт базовых хуков RTK Query (используются в кастомных хуках)
export const { useAuthTelegramMutation, useRefreshTokenMutation, useUpdateRoleMutation } = authApi
