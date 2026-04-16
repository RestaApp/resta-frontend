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
import { updateUserDataInStore } from '@/utils/userData'

const extractApiErrors = (error: unknown): string[] => {
  if (!error || typeof error !== 'object' || !('data' in error)) return []

  const data = (error as { data?: unknown }).data
  if (!data || typeof data !== 'object') return []

  const apiData = data as { errors?: unknown; message?: unknown; error?: unknown }
  if (Array.isArray(apiData.errors)) {
    return apiData.errors.filter((value): value is string => typeof value === 'string')
  }
  if (typeof apiData.message === 'string' && apiData.message.trim()) return [apiData.message]
  if (typeof apiData.error === 'string' && apiData.error.trim()) return [apiData.error]
  return []
}

/**
 * Хук для обновления данных пользователя
 */
export const useUpdateUser = () => {
  const dispatch = useAppDispatch()
  const [updateUserMutation, { isLoading, error }] = useUpdateUserMutation()

  const updateUser = useCallback(
    async (id: number, data: UpdateUserRequest) => {
      let result: UpdateUserResponse
      try {
        result = await updateUserMutation({ id, data }).unwrap()
      } catch (requestError) {
        return {
          success: false,
          errors: extractApiErrors(requestError),
        }
      }

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
