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
} from '../services/api/authApi'
import { authService } from '../services/auth'
import { updateUserDataInStore, dispatchAuthEvent } from '../utils/userData'

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

          // Сохраняем данные пользователя в Redux (они автоматически сохранятся в sessionStorage через redux-persist)
          updateUserDataInStore(dispatch, result.data)

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

