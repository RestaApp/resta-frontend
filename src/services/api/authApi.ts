/**
 * API для авторизации через Telegram
 */

import { api } from '../../store/api'
import { authService } from '../auth'

export interface TelegramAuthRequest {
  initData: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    firstName: string
    lastName?: string
    username?: string
    languageCode?: string
    isPremium?: boolean
    photoUrl?: string
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
        url: '/v1/auth/telegram',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          // Сохраняем токены при успешной авторизации
          authService.setTokens(data.accessToken, data.refreshToken)
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
          url: '/v1/auth/refresh',
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
