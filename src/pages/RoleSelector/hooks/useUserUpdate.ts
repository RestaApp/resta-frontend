/**
 * Хук для общей логики обновления пользователя
 * Инкапсулирует повторяющуюся логику проверки авторизации и получения userId
 */

import { useCallback, useRef } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useUpdateUser } from '../../../hooks/useUsers'
import { getCurrentUserId } from '../../../utils/user'
import type { UpdateUserRequest } from '../../../services/api/usersApi'
import type { UserRole } from '../../../types'

interface UseUserUpdateResult {
  updateUserRole: (
    role: UserRole,
    onSelectRole: (role: UserRole) => void,
    onError?: (error: string) => void
  ) => Promise<boolean>
  updateUserWithData: (
    updateData: UpdateUserRequest,
    onSuccess: () => void,
    onError?: (error: string) => void
  ) => Promise<boolean>
}

export const useUserUpdate = (): UseUserUpdateResult => {
  const { isAuthenticated } = useAuth()
  const { updateUser } = useUpdateUser()
  const isSubmittingRef = useRef(false)

  /**
   * Обновляет роль пользователя
   */
  const updateUserRole = useCallback(
    async (
      role: UserRole,
      onSelectRole: (role: UserRole) => void,
      onError?: (error: string) => void
    ): Promise<boolean> => {
      if (!isAuthenticated) {
        onSelectRole(role)
        return true
      }

      const userId = await getCurrentUserId()
      if (!userId) {
        onSelectRole(role)
        return true
      }

      try {
        const updateData: UpdateUserRequest = {
          user: {
            role,
          },
        }

        await updateUser(userId, updateData)
        onSelectRole(role)
        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при сохранении данных'
        if (onError) {
          onError(errorMessage)
        }
        onSelectRole(role)
        return false
      }
    },
    [isAuthenticated, updateUser]
  )

  /**
   * Обновляет пользователя с произвольными данными
   */
  const updateUserWithData = useCallback(
    async (
      updateData: UpdateUserRequest,
      onSuccess: () => void,
      onError?: (error: string) => void
    ): Promise<boolean> => {
      // Защита от двойного вызова
      if (isSubmittingRef.current) {
        return false
      }

      if (!isAuthenticated) {
        onSuccess()
        return true
      }

      const userId = await getCurrentUserId()
      if (!userId) {
        onSuccess()
        return true
      }

      isSubmittingRef.current = true

      try {
        if (!updateUser) {
          throw new Error('updateUser функция не определена')
        }

        const result = await updateUser(userId, updateData)

        if (!result.success) {
          const errors = result.errors || ['Произошла ошибка при сохранении данных']
          const errorMessage = errors.join('\n')
          if (onError) {
            onError(errorMessage)
          }
          isSubmittingRef.current = false
          return false
        }

        onSuccess()
        return true
      } catch (error) {
        console.error('Ошибка обновления данных пользователя:', error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Произошла ошибка при сохранении данных. Попробуйте еще раз.'
        if (onError) {
          onError(errorMessage)
        }
        return false
      } finally {
        isSubmittingRef.current = false
      }
    },
    [isAuthenticated, updateUser]
  )

  return {
    updateUserRole,
    updateUserWithData,
  }
}

