/**
 * API для авторизации через Telegram
 */

import { api } from '../../store/api'
import { authService } from '../auth'

export interface TelegramAuthRequest {
  initData: string
}

export interface UserData {
  id: number
  active: boolean
  available_for_work: boolean
  average_rating: number
  bio: string | null
  created_at: string
  email: string | null
  experience_years: number | null
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
  service_categories: unknown[]
  service_categories_list: string | null
  specialization: string | null
  telegram_id: number
  total_reviews: number
  updated_at: string
  username: string
  website: string | null
  work_experience_summary: string | null
  work_preferences: Record<string, unknown>
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

export const authApi = api.injectEndpoints({
  endpoints: builder => ({
    // Авторизация через Telegram
    authTelegram: builder.mutation<AuthResponse, TelegramAuthRequest>({
      query: body => ({
        url: '/api/v1/auth/sign_in',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          // Сохраняем токен при успешной авторизации
          // API возвращает только один токен в meta.token
          if (data.success && data.meta.token) {
            authService.setToken(data.meta.token)
            // Сохраняем данные пользователя в localStorage для быстрого доступа
            localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(data.data))
          }
        } catch {
          // Ошибка обрабатывается автоматически
        }
      },
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
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          // Обновляем токены при успешном обновлении
          authService.setTokens(data.accessToken, data.refreshToken)
        } catch {
          // При ошибке обновления токена - выходим
          authService.logout()
        }
      },
    }),
  }),
})

// Экспорт хуков для использования в компонентах
export const { useAuthTelegramMutation, useRefreshTokenMutation } = authApi

/**
 * Утилиты для работы с данными пользователя
 */
import { STORAGE_KEYS } from '../../constants/storage'

const USER_DATA_STORAGE_KEY = STORAGE_KEYS.USER_DATA

/**
 * Получает данные пользователя из localStorage
 */
export function getUserData(): UserData | null {
  if (typeof window === 'undefined') {
    return null
  }
  const stored = localStorage.getItem(USER_DATA_STORAGE_KEY)
  if (!stored) {
    return null
  }
  try {
    return JSON.parse(stored) as UserData
  } catch {
    return null
  }
}

/**
 * Очищает данные пользователя из localStorage
 */
export function clearUserData(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(USER_DATA_STORAGE_KEY)
}
