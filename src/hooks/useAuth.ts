/**
 * Хук для работы с авторизацией
 * Инкапсулирует логику авторизации и работы с токенами
 */

import { useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'
import {
  useAuthTelegramMutation,
  useRefreshTokenMutation,
  useUpdateRoleMutation,
  type TelegramAuthRequest,
  type UpdateRoleRequest,
  type UserData,
  type SignInResponse,
} from '@/services/api/authApi'
import { usersApi } from '@/services/api/usersApi'
import { authService } from '@/services/auth'
import { updateUserDataInStore, dispatchAuthEvent } from '@/utils/userData'
import { isVerifiedRole, mapRoleFromApi } from '@/utils/roles'
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
  const [updateRoleMutation, { isLoading: isUpdateRoleLoading }] = useUpdateRoleMutation()

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

          // Проверяем роль из ответа sign_in
          // Если роль не unverified - загружаем полные данные пользователя
          // Если роль unverified - не загружаем, переходим на RoleSelector
          const apiRole = mapRoleFromApi(result.data.role)
          if (isVerifiedRole(apiRole)) {
            // Роль выбрана (не unverified) - загружаем полные данные пользователя
            // Это должно происходить перед загрузкой каких-либо других данных
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
          // Если роль unverified - не загружаем user/, просто сохраняем минимальные данные
          // и показываем RoleSelector (логика в App.tsx)
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
      const result = await updateRoleMutation(request).unwrap()

      // Обновляем данные пользователя в Redux после успешного обновления роли
      if (result.success && result.data) {
        updateUserDataInStore(dispatch, result.data)
      }

      return result
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
