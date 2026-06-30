import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser } from '@/shared/lib/hooks/useUser'
import { useToast } from '@/shared/lib/hooks/useToast'
import { useUpdateUser } from '@/shared/lib/hooks/useUsers'
import { authService } from '@/services/auth'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import type { ApiRole } from '@/shared/types/roles.types'
import type { UserData } from '@/services/api/authApi'

interface UseProfileAccountActionsParams {
  userProfile: UserData | null | undefined
  apiRole: ApiRole | null
}

/** Actions-слой профиля: выход, удаление аккаунта, переключение open_to_work. */
export const useProfileAccountActions = ({
  userProfile,
  apiRole,
}: UseProfileAccountActionsParams) => {
  const { t } = useTranslation()
  const { clearUserData } = useUser()
  const { showToast } = useToast()
  const { updateUser, isLoading: isUpdatingUser } = useUpdateUser()

  const handleLogout = useCallback(() => {
    authService.logout()
    clearUserData()
    emitAppEvent(APP_EVENTS.AUTH_LOGOUT)
    showToast(t('auth.loggedOut'), 'success')
    window.location.reload()
  }, [clearUserData, showToast, t])

  const handleDeleteAccount = useCallback(async () => {
    if (!userProfile?.id) throw new Error('No user')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/users/${userProfile.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) throw new Error('Delete failed')
    authService.logout()
    clearUserData()
    emitAppEvent(APP_EVENTS.AUTH_LOGOUT)
    showToast(t('legal.deleteAccount.success'), 'success')
    window.location.reload()
  }, [clearUserData, showToast, t, userProfile])

  const handleOpenToWorkToggle = useCallback(
    async (nextValue: boolean) => {
      if (!userProfile?.id || apiRole !== 'employee') return

      const result = await updateUser(userProfile.id, {
        user: {
          open_to_work: nextValue,
          employee_profile_attributes: {
            open_to_work: nextValue,
          },
        },
      })

      if (result.success) {
        return
      }

      showToast(result.errors?.[0] ?? t('errors.saveErrorDescription'), 'error')
    },
    [apiRole, showToast, t, updateUser, userProfile]
  )

  return { handleLogout, handleDeleteAccount, handleOpenToWorkToggle, isUpdatingUser }
}
