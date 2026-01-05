/**
 * Хук для общей логики обновления пользователя
 * Инкапсулирует повторяющуюся логику проверки авторизации и получения userId
 */

import { useCallback, useRef } from 'react'
import { useUpdateUser } from '@/hooks/useUsers'
import { getCurrentUserId } from '@/utils/user'
import { logger } from '@/utils/logger'
import type { UpdateUserRequest } from '@/services/api/usersApi'
import type { UiRole } from '@/types'
import { mapUiRoleToApiRole } from '@/utils/roles'
import { useAuth } from '@/contexts/AuthContext'

interface UseUserUpdateResult {
  updateUiRole: (
    role: UiRole,
    onSelectRole: (role: UiRole) => void,
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
   * Строгий контракт: onSelectRole вызывается только при успехе
   */
  const updateUiRole = useCallback(
    async (
      role: UiRole,
      onSelectRole: (role: UiRole) => void,
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
          user: { role: mapUiRoleToApiRole(role) },
        }

        const result = await updateUser(userId, updateData)

        // если updateUser возвращает success/errors — проверяем
        if (result && typeof result === 'object' && 'success' in result && result.success === false) {
          const msg = (result.errors || ['Произошла ошибка при сохранении данных']).join('\n')
          onError?.(msg)
          return false
        }

        onSelectRole(role)
        return true
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Произошла ошибка при сохранении данных'
        onError?.(msg)
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
        logger.error('Ошибка обновления данных пользователя:', error)
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
    updateUiRole,
    updateUserWithData,
  }
}

