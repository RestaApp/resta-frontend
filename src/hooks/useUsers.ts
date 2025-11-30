/**
 * Хук для работы с пользователями
 * Инкапсулирует логику работы с данными пользователей
 */

import { useCallback } from 'react'
import { useAppDispatch } from '../store/hooks'
import { useUpdateUserMutation, type UpdateUserRequest } from '../services/api/usersApi'
import { updateUserDataInStore } from '../utils/userData'

/**
 * Хук для обновления данных пользователя
 */
export function useUpdateUser() {
  const dispatch = useAppDispatch()
  const [updateUserMutation, { isLoading, error }] = useUpdateUserMutation()

  const updateUser = useCallback(
    async (id: number, data: UpdateUserRequest) => {
      try {
        const result = await updateUserMutation({ id, data }).unwrap()

        // Обновляем данные пользователя в Redux после успешного обновления
        if (result.success && result.data) {
          updateUserDataInStore(dispatch, result.data)
        }

        return result
      } catch (error) {
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


