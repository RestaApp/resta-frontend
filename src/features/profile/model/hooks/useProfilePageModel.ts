import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserProfile } from '@/shared/lib/hooks/useUserProfile'
import { useUser } from '@/shared/lib/hooks/useUser'
import { useToast } from '@/shared/lib/hooks/useToast'
import { useGetMyShiftsQuery, useGetReceivedShiftApplicationsQuery } from '@/services/api/shiftsApi'
import { buildVenueProfileInfoRows } from '../utils/buildVenueProfileInfoRows'
import { countAcceptedHires, countOpenVenueListings } from '../utils/venueProfileStats'
import { mapRoleFromApi } from '@/shared/utils/roles'
import type { ApiRole } from '@/shared/types/roles.types'
import { authService } from '@/services/auth'
import { getLocalStorageItem, removeLocalStorageItem } from '@/shared/utils/localStorage'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { useLabels } from '@/shared/i18n/hooks'
import { normalizeVacanciesResponse } from '@/shared/shifts/normalizeShiftsResponse'
import { getProfileCompleteness } from '@/shared/utils/profileCompleteness'
import { formatProfileDisplayName } from '@/shared/utils/userDisplayName'
import { useAuth } from '@/app/contexts/auth'
import { APP_EVENTS, emitAppEvent, onAppEvent } from '@/shared/utils/appEvents'
import { buildProfileViewModel } from '@/shared/ui/user-profile/buildProfileViewModel'
import { useUpdateUser } from '@/shared/lib/hooks/useUsers'
import { getSupplierCategory, getSupplierProfile } from '@/shared/utils/supplierProfile'

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
  const [isNotificationPrefsDrawerOpen, setIsNotificationPrefsDrawerOpen] = useState(() => {
    const shouldOpen = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_NOTIFICATION_PREFERENCES)
    return shouldOpen === 'true'
  })

  // legacy: open drawer by localStorage flag
  useEffect(() => {
    const shouldOpenEdit = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT)
    if (shouldOpenEdit === 'true') {
      removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT)
    }
  }, [])

  useEffect(() => {
    const shouldOpen = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_NOTIFICATION_PREFERENCES)
    if (shouldOpen === 'true') {
      removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_NOTIFICATION_PREFERENCES)
    }
  }, [])

  // legacy: open drawer by window event
  useEffect(() => {
    return onAppEvent(APP_EVENTS.OPEN_PROFILE_EDIT, () => {
      setIsEditDrawerOpen(true)
    })
  }, [])

  useEffect(() => {
    return onAppEvent(APP_EVENTS.OPEN_NOTIFICATION_PREFERENCES, () => {
      setIsNotificationPrefsDrawerOpen(true)
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

  const { data: receivedApplicationsData } = useGetReceivedShiftApplicationsQuery(undefined, {
    skip: !isAuthenticated || apiRole !== 'restaurant',
  })

  const myShifts = useMemo(() => normalizeVacanciesResponse(myShiftsData), [myShiftsData])

  const venueOpenShiftsCount = useMemo(() => countOpenVenueListings(myShifts), [myShifts])

  const venueHiresCount = useMemo(() => {
    const applications =
      receivedApplicationsData?.data && Array.isArray(receivedApplicationsData.data)
        ? receivedApplicationsData.data
        : []
    return countAcceptedHires(applications)
  }, [receivedApplicationsData])

  const userName = useMemo(
    () => formatProfileDisplayName(userProfile, apiRole, t('common.user')),
    [userProfile, apiRole, t]
  )

  const roleLabel = useMemo(() => {
    if (!userProfile) return t('common.user')
    if (apiRole === 'employee') {
      const position = userProfile.position || userProfile.employee_profile?.position
      return position ? getEmployeePositionLabel(position) : t('profile.subtitle.employee')
    }
    if (apiRole === 'restaurant') {
      const format = userProfile.restaurant_profile?.restaurant_format?.trim()
      return format ? getRestaurantFormatLabel(format) : t('profile.subtitle.venue')
    }
    if (apiRole === 'supplier') {
      const category = getSupplierCategory(getSupplierProfile(userProfile))
      return category ? getSupplierTypeLabel(category) : t('profile.subtitle.supplier')
    }
    return t('common.user')
  }, [
    apiRole,
    userProfile,
    getEmployeePositionLabel,
    getRestaurantFormatLabel,
    getSupplierTypeLabel,
    t,
  ])

  const venueInfoRows = useMemo(() => {
    if (!userProfile || apiRole !== 'restaurant') return []

    return buildVenueProfileInfoRows({
      t,
      userProfile,
      venueTypeLabel: roleLabel,
    })
  }, [apiRole, roleLabel, t, userProfile])

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
    })
  }, [
    apiRole,
    employeeStats.completedShifts,
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
    venueInfoRows,
    venueOpenShiftsCount,
    venueHiresCount,

    isEditDrawerOpen,
    setIsEditDrawerOpen,

    isNotificationPrefsDrawerOpen,
    setIsNotificationPrefsDrawerOpen,

    isUpdatingUser,
    handleOpenToWorkToggle,
    handleLogout,
    handleDeleteAccount,
  } as const
}
