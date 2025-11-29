/**
 * Хук для работы с пользователями
 * Инкапсулирует логику работы с данными пользователей
 */

import { useCallback } from 'react'
import { useAppDispatch } from '../store/hooks'
import { useUpdateUserMutation, type UpdateUserRequest } from '../services/api/usersApi'
import { updateUserDataInStore } from '../utils/userData'
import { logger } from '../utils/logger'

/**
 * Хук для обновления данных пользователя
 */
export function useUpdateUser() {
  const dispatch = useAppDispatch()
  const [updateUserMutation, { isLoading, error }] = useUpdateUserMutation()

  const updateUser = useCallback(
    async (id: number, data: UpdateUserRequest) => {
      logger.log('[useUpdateUser] Начало обновления пользователя:', { id, data })
      try {
        const result = await updateUserMutation({ id, data }).unwrap()
        logger.log('[useUpdateUser] Ответ от сервера:', result)

        // Обновляем данные пользователя в Redux после успешного обновления
        if (result.success && result.data) {
          logger.log('[useUpdateUser] Обновление данных в Redux store')
          updateUserDataInStore(dispatch, result.data)
        }

        return result
      } catch (error) {
        logger.error('[useUpdateUser] Ошибка при обновлении пользователя:', error)
        throw error
      }
    },
    [updateUserMutation, dispatch]
  )

  return {
    updateUser,
    isLoading,
    error,
  }
}


