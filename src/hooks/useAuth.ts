/**
 * Хук для работы с авторизацией
 * Инкапсулирует логику авторизации и работы с токенами
 */

import { useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'
import {
  useAuthTelegramMutation,
  useRefreshTokenMutation,
  type TelegramAuthRequest,
  type UserData,
  type SignInResponse,
} from '@/services/api/authApi'
import { usersApi } from '@/services/api/usersApi'
import { authService } from '@/services/auth'
import { updateUserDataInStore, dispatchAuthEvent } from '@/utils/userData'
import { logger } from '@/utils/logger'

/**
 * Создает минимальный объект UserData из данных sign_in ответа
 * Используется для временного сохранения данных до загрузки полного профиля
 */
function createMinimalUserData(signInData: SignInResponse['data']): UserData {
  return {
    id: signInData.id,
    role: signInData.role,
    active: false,
    average_rating: 0,
    bio: null,
    created_at: '',
    email: null,
    employee_profile: null,
    full_name: '',
    language: '',
    last_name: '',
    location: null,
    name: '',
    phone: null,
    photo_url: null,
    profile_complete: false,
    profile_photo_url: null,
    telegram_id: 0,
    total_reviews: 0,
    updated_at: '',
    username: '',
    website: null,
    business_hours: null,
    work_experience_summary: null,
    work_preferences: {},
  }
}

/**
 * Хук для работы с авторизацией (мутации и действия)
 */
export const useAuthActions = () => {
  const dispatch = useAppDispatch()
  const [authTelegramMutation, { isLoading: isAuthLoading }] = useAuthTelegramMutation()
  const [refreshTokenMutation, { isLoading: isRefreshLoading }] = useRefreshTokenMutation()
  /**
   * Авторизация через Telegram
   */
  const authTelegram = useCallback(
    async (request: TelegramAuthRequest) => {
      const result = await authTelegramMutation(request).unwrap()

      // Сохраняем токен при успешной авторизации
      if (result.success && result.meta.token) {
        // ВАЖНО: Сохраняем токен СРАЗУ и СИНХРОННО перед любыми другими операциями
        authService.setToken(result.meta.token)

        // При sign_in получаем только id и role, полные данные пользователя
        // будут загружены отдельным запросом (например, через useUserProfile)
        // Сохраняем минимальные данные (id и role) для возможности загрузки полного профиля
        if (result.data) {
          const minimalUserData = createMinimalUserData(result.data)
          updateUserDataInStore(dispatch, minimalUserData)

          // После sign_in всегда пытаемся загрузить полный профиль пользователя
          // Это нужно, чтобы сразу получить актуальные contact-поля (например phone)
          // и показать их в шагах онбординга без ожидания ручного обновления.
          const userId = result.data.id
          if (userId) {
            const subscription = dispatch(usersApi.endpoints.getUser.initiate(userId))
            try {
              const userResult = await subscription

              // RTK Query возвращает объект с полем data при успешном ответе
              if (userResult && 'data' in userResult && userResult.data?.data) {
                updateUserDataInStore(dispatch, userResult.data.data)
              }
            } catch (error) {
              // Игнорируем ошибки загрузки пользователя, минимальные данные уже сохранены
              logger.error('Ошибка загрузки данных пользователя:', error)
            } finally {
              // Отписываемся, чтобы не держать постоянную подписку в store
              subscription.unsubscribe()
            }
          }
        }

        // Отправляем событие об успешной авторизации
        dispatchAuthEvent()
      }

      return result
    },
    [authTelegramMutation, dispatch]
  )

  /**
   * Обновление JWT токена
   */
  const refreshToken = useCallback(async () => {
    try {
      return await refreshTokenMutation().unwrap()
    } catch (error) {
      authService.logout()
      throw error
    }
  }, [refreshTokenMutation])

  return {
    authTelegram,
    refreshToken,
    isLoading: isAuthLoading || isRefreshLoading,
  }
}
