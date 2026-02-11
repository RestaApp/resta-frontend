/**
 * Хук для работы с пользователями
 * Инкапсулирует логику работы с данными пользователей
 */

import { useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { useUpdateUserMutation, type UpdateUserRequest } from '@/services/api/usersApi'
import { updateUserDataInStore } from '@/utils/userData'

/**
 * Хук для обновления данных пользователя
 */
export const useUpdateUser = () => {
  const dispatch = useAppDispatch()
  const [updateUserMutation, { isLoading, error }] = useUpdateUserMutation()

  const updateUser = useCallback(
    async (id: number, data: UpdateUserRequest) => {
      const result = await updateUserMutation({ id, data }).unwrap()

      // Обновляем данные пользователя в Redux только при успешном обновлении
      // и только если success: true и есть данные
      if (result.success && result.data) {
        updateUserDataInStore(dispatch, result.data)
      }

      // Если success: false, возвращаем результат с ошибками, но не обновляем Redux
      return result
    },
    [updateUserMutation, dispatch]
  )

  return {
    updateUser,
    isLoading,
    error,
  }
}
