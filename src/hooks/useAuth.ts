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
import { logger } from '../utils/logger'

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
        logger.log('[useAuth] Начало авторизации через Telegram (sign_in)')
        const result = await authTelegramMutation(request).unwrap()
        logger.log('[useAuth] Ответ от sign_in:', {
          success: result.success,
          hasToken: !!result.meta?.token,
          userId: result.data?.id,
          role: result.data?.role,
        })

        // Сохраняем токен при успешной авторизации
        if (result.success && result.meta.token) {
          // ВАЖНО: Сохраняем токен СРАЗУ и СИНХРОННО перед любыми другими операциями
          authService.setToken(result.meta.token)
          logger.log('[useAuth] ✅ Токен сохранен в localStorage:', {
            tokenLength: result.meta.token.length,
            tokenPreview: result.meta.token.substring(0, 20) + '...',
          })
          
          // Проверяем, что токен действительно сохранен
          const savedToken = authService.getToken()
          if (!savedToken) {
            logger.error('[useAuth] ❌ ОШИБКА: Токен не был сохранен!')
          } else {
            logger.log('[useAuth] ✅ Токен успешно сохранен и доступен для последующих запросов')
          }

          // Сохраняем данные пользователя в Redux (они автоматически сохранятся в sessionStorage через redux-persist)
          logger.log('[useAuth] Сохранение userData в Redux store:', {
            id: result.data.id,
            role: result.data.role,
            full_name: result.data.full_name,
          })
          updateUserDataInStore(dispatch, result.data)
          logger.log('[useAuth] userData сохранен в Redux (будет автоматически сохранен в sessionStorage)')

          // Раньше здесь инвалидировался кэш 'User', что вызывало повторный запрос ролей.
          // Теперь не инвалидируем глобально — роли будут загружены один раз после сохранения токена.
          // При необходимости таргетированной инвалидации — делаем это в отдельных местах.

          // Отправляем событие об успешной авторизации
          dispatchAuthEvent()
        }

        return result
      } catch (error) {
        logger.error('[useAuth] Ошибка при авторизации через Telegram:', error)
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
        logger.log('[useAuth] updateRole вызван с запросом:', request)
        const result = await updateRoleMutation(request).unwrap()
        logger.log('[useAuth] updateRole результат:', result)

        // Обновляем данные пользователя в Redux после успешного обновления роли
        if (result.success && result.data) {
          logger.log('[useAuth] Обновление userData в Redux store')
          updateUserDataInStore(dispatch, result.data)
        }

        return result
      } catch (error) {
        logger.error('[useAuth] Ошибка при обновлении роли:', error)
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

