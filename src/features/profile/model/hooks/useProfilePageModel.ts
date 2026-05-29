import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUser } from '@/hooks/useUser'
import { useToast } from '@/hooks/useToast'
import { useGetMyShiftsQuery } from '@/services/api/shiftsApi'
import { mapRoleFromApi } from '@/utils/roles'
import type { ApiRole } from '@/types'
import { authService } from '@/services/auth'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { useLabels } from '@/shared/i18n/hooks'
import { normalizeVacanciesResponse } from '../utils/normalizeShiftsResponse'
import { getProfileCompleteness } from '../utils/profileCompleteness'
import { useAuth } from '@/contexts/auth'
import { APP_EVENTS, emitAppEvent, onAppEvent } from '@/shared/utils/appEvents'
import { buildProfileViewModel } from '../buildProfileViewModel'
import { useUpdateUser } from '@/hooks/useUsers'

export const useProfilePageModel = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const {
    getEmployeePositionLabel,
    getRestaurantFormatLabel,
    getSpecializationLabel,
    getSupplierTypeLabel,
  } = useLabels()
  const { userProfile, isLoading: isProfileLoading } = useUserProfile()
  const { clearUserData } = useUser()
  const { showToast } = useToast()
  const { updateUser, isLoading: isUpdatingUser } = useUpdateUser()

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(() => {
    const shouldOpenEdit = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT)
    return shouldOpenEdit === 'true'
  })
  const [isNotificationPrefsDrawerOpen, setIsNotificationPrefsDrawerOpen] = useState(false)

  // legacy: open drawer by localStorage flag
  useEffect(() => {
    const shouldOpenEdit = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT)
    if (shouldOpenEdit === 'true') {
      removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT)
    }
  }, [])

  // legacy: open drawer by window event
  useEffect(() => {
    return onAppEvent(APP_EVENTS.OPEN_PROFILE_EDIT, () => {
      setIsEditDrawerOpen(true)
    })
  }, [])

  const apiRole = useMemo<ApiRole | null>(() => {
    const roleValue = userProfile?.role
    if (!roleValue) return null
    return mapRoleFromApi(roleValue)
  }, [userProfile?.role])

  const { data: myShiftsData } = useGetMyShiftsQuery(undefined, {
    skip: !isAuthenticated,
  })

  const myShifts = useMemo(() => normalizeVacanciesResponse(myShiftsData), [myShiftsData])

  const userName = useMemo(() => {
    if (!userProfile) return t('common.user')
    if (apiRole === 'restaurant') {
      const venue = userProfile.restaurant_profile?.name?.trim()
      if (venue) return venue
    }
    return userProfile.full_name || userProfile.name || t('common.user')
  }, [userProfile, apiRole, t])

  const roleLabel = useMemo(() => {
    if (!userProfile) return t('common.user')
    if (apiRole === 'employee') {
      const position = userProfile.position || userProfile.employee_profile?.position
      return position ? getEmployeePositionLabel(position) : t('profile.subtitle.employee')
    }
    if (apiRole === 'restaurant') return t('profile.subtitle.venue')
    if (apiRole === 'supplier') return t('profile.subtitle.supplier')
    return t('common.user')
  }, [apiRole, userProfile, getEmployeePositionLabel, t])

  const employeeStats = useMemo(() => {
    const completedShifts = myShifts.reduce((acc, s) => {
      return s.status === 'completed' ? acc + 1 : acc
    }, 0)

    return { completedShifts }
  }, [myShifts])

  const profileCompleteness = useMemo(() => {
    if (!userProfile) return null
    return getProfileCompleteness(userProfile, apiRole)
  }, [userProfile, apiRole])

  const handleLogout = useCallback(() => {
    authService.logout()
    clearUserData()
    emitAppEvent(APP_EVENTS.AUTH_LOGOUT)
    showToast(t('auth.loggedOut'), 'success')
    window.location.reload()
  }, [clearUserData, showToast, t])
  const handleEditSuccess = useCallback(() => {
    // cache is updated automatically via onQueryStarted in the mutation
  }, [])

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

  const profileViewModel = useMemo(() => {
    if (!userProfile) return null

    return buildProfileViewModel({
      t,
      userProfile,
      apiRole,
      userName,
      roleLabel,
      completeness: profileCompleteness,
      completedShifts: employeeStats.completedShifts,
      myShiftsCount: myShifts.length,
      getSpecializationLabel,
      getSupplierTypeLabel,
      getRestaurantFormatLabel,
    })
  }, [
    apiRole,
    employeeStats.completedShifts,
    getRestaurantFormatLabel,
    getSpecializationLabel,
    getSupplierTypeLabel,
    myShifts.length,
    profileCompleteness,
    roleLabel,
    t,
    userName,
    userProfile,
  ])

  return {
    userProfile,
    isProfileLoading,

    apiRole,
    profileViewModel,

    isEditDrawerOpen,
    handleEditSuccess,
    setIsEditDrawerOpen,

    isNotificationPrefsDrawerOpen,
    setIsNotificationPrefsDrawerOpen,

    isUpdatingUser,
    handleOpenToWorkToggle,
    handleLogout,
  } as const
}
