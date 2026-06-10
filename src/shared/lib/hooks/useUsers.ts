/**
 * Хук для работы с пользователями
 * Инкапсулирует логику работы с данными пользователей
 */

import { useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'
import {
  useUpdateUserMutation,
  type UpdateUserRequest,
  type UpdateUserResponse,
} from '@/services/api/usersApi'
import { updateUserDataInStore } from '@/shared/utils/userData'
import { getErrorMessages } from '@/shared/utils/getErrorMessage'

/**
 * Хук для обновления данных пользователя
 */
export const useUpdateUser = () => {
  const dispatch = useAppDispatch()
  const [updateUserMutation, { isLoading, error }] = useUpdateUserMutation()

  const updateUser = useCallback(
    async (id: number, data: UpdateUserRequest, options?: { preserveSelectedRole?: boolean }) => {
      let result: UpdateUserResponse
      try {
        result = await updateUserMutation({ id, data }).unwrap()
      } catch (requestError) {
        return {
          success: false,
          errors: getErrorMessages(requestError),
        }
      }

      // Обновляем данные пользователя в Redux только при успешном обновлении
      // и только если success: true и есть данные
      if (result.success && result.data) {
        updateUserDataInStore(dispatch, result.data, options)
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
