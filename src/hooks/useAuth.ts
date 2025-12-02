/**
 * Хук для работы с авторизацией
 * Инкапсулирует логику авторизации и работы с токенами
 */

import { useCallback } from 'react'
import { useAppDispatch } from '../store/hooks'
import {
  useAuthTelegramMutation,
  useRefreshTokenMutation,
  useUpdateRoleMutation,
  type TelegramAuthRequest,
  type UpdateRoleRequest,
  type UserData,
  type SignInResponse,
} from '../services/api/authApi'
import { authService } from '../services/auth'
import { updateUserDataInStore, dispatchAuthEvent } from '../utils/userData'

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
    work_experience_summary: null,
    work_preferences: {},
  }
}

/**
 * Хук для работы с авторизацией (мутации и действия)
 */
export function useAuthActions() {
  const dispatch = useAppDispatch()
  const [authTelegramMutation, { isLoading: isAuthLoading }] = useAuthTelegramMutation()
  const [refreshTokenMutation, { isLoading: isRefreshLoading }] = useRefreshTokenMutation()
  const [updateRoleMutation, { isLoading: isUpdateRoleLoading }] = useUpdateRoleMutation()

  /**
   * Авторизация через Telegram
   */
  const authTelegram = useCallback(
    async (request: TelegramAuthRequest) => {
      try {
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
          }

          // Отправляем событие об успешной авторизации
          dispatchAuthEvent()
        }

        return result
      } catch (error) {
        throw error
      }
    },
    [authTelegramMutation, dispatch]
  )

  /**
   * Обновление JWT токена
   */
  const refreshToken = useCallback(async () => {
    try {
      const result = await refreshTokenMutation().unwrap()

      // Обновляем токены при успешном обновлении
      authService.setTokens(result.accessToken, result.refreshToken)

      return result
    } catch (error) {
      // При ошибке обновления токена - выходим
      authService.logout()
      throw error
    }
  }, [refreshTokenMutation])

  /**
   * Обновление роли пользователя
   */
  const updateRole = useCallback(
    async (request: UpdateRoleRequest) => {
      try {
        const result = await updateRoleMutation(request).unwrap()

        // Обновляем данные пользователя в Redux после успешного обновления роли
        if (result.success && result.data) {
          updateUserDataInStore(dispatch, result.data)
        }

        return result
      } catch (error) {
        throw error
      }
    },
    [updateRoleMutation, dispatch]
  )

  return {
    authTelegram,
    refreshToken,
    updateRole,
    isLoading: isAuthLoading || isRefreshLoading || isUpdateRoleLoading,
  }
}

