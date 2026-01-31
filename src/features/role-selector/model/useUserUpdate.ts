/**
 * Хук для общей логики обновления пользователя
 * Инкапсулирует повторяющуюся логику проверки авторизации и получения userId
 */

import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useUpdateUser } from '@/hooks/useUsers'
import { getCurrentUserId } from '@/utils/user'
import { logger } from '@/utils/logger'
import type { UpdateUserRequest } from '@/services/api/usersApi'
import type { UiRole } from '@/shared/types/roles.types'
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
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { updateUser } = useUpdateUser()
  const isSubmittingRef = useRef(false)
  const saveErrorFallback = t('errors.saveErrorDescription')
  const saveErrorRetry = t('saveErrorRetry')

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

      const userId = getCurrentUserId()
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
          const msg = (result.errors || [saveErrorFallback]).join('\n')
          onError?.(msg)
          return false
        }

        onSelectRole(role)
        return true
      } catch (error) {
        const msg = error instanceof Error ? error.message : saveErrorFallback
        onError?.(msg)
        return false
      }
    },
    [isAuthenticated, updateUser, saveErrorFallback]
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

      const userId = getCurrentUserId()
      if (!userId) {
        onSuccess()
        return true
      }

      isSubmittingRef.current = true

      try {
        if (!updateUser) {
          throw new Error(saveErrorFallback)
        }

        const result = await updateUser(userId, updateData)

        if (!result.success) {
          const errors = result.errors || [saveErrorFallback]
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
            : saveErrorRetry
        if (onError) {
          onError(errorMessage)
        }
        return false
      } finally {
        isSubmittingRef.current = false
      }
    },
    [isAuthenticated, updateUser, saveErrorFallback, saveErrorRetry]
  )

  return {
    updateUiRole,
    updateUserWithData,
  }
}
