import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUser } from '@/hooks/useUser'
import { useToast } from '@/hooks/useToast'
import { useGetMyShiftsQuery, useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import { mapRoleFromApi } from '@/utils/roles'
import type { ApiRole } from '@/types'
import { authService } from '@/services/auth'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { useLabels } from '@/shared/i18n/hooks'
import { normalizeVacanciesResponse } from '../utils/normalizeShiftsResponse'
import { getProfileCompleteness } from '../utils/profileCompleteness'

export const useProfilePageModel = () => {
  const { t } = useTranslation()
  const { getEmployeePositionLabel } = useLabels()
  const { userProfile, isLoading: isProfileLoading, refetch } = useUserProfile()
  const { clearUserData } = useUser()
  const { showToast } = useToast()

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
    const handleOpenEdit = () => setIsEditDrawerOpen(true)
    window.addEventListener('openProfileEdit', handleOpenEdit)
    return () => window.removeEventListener('openProfileEdit', handleOpenEdit)
  }, [])

  const { data: myShiftsData } = useGetMyShiftsQuery()
  const { data: appliedShiftsData } = useGetAppliedShiftsQuery()

  const myShifts = useMemo(() => normalizeVacanciesResponse(myShiftsData), [myShiftsData])
  const appliedShifts = useMemo(
    () => normalizeVacanciesResponse(appliedShiftsData),
    [appliedShiftsData]
  )

  const apiRole = useMemo<ApiRole | null>(() => {
    const roleValue = userProfile?.role
    if (!roleValue) return null
    return mapRoleFromApi(roleValue)
  }, [userProfile?.role])

  const userName = useMemo(() => {
    if (!userProfile) return t('common.user')
    return userProfile.full_name || userProfile.name || t('common.user')
  }, [userProfile, t])

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

  const specializations = useMemo(() => {
    if (apiRole !== 'employee') return []
    return userProfile?.employee_profile?.specializations || []
  }, [apiRole, userProfile])

  const employeeStats = useMemo(() => {
    const completedShifts = myShifts.reduce((acc, s) => {
      return s.status === 'completed' ? acc + 1 : acc
    }, 0)

    const activeApplications = appliedShifts.reduce((acc, s) => {
      const a = s.my_application
      if (!a) return acc
      return a.status !== 'rejected' && a.status !== 'cancelled' ? acc + 1 : acc
    }, 0)

    return { completedShifts, activeApplications }
  }, [myShifts, appliedShifts])

  const profileCompleteness = useMemo(() => {
    if (!userProfile) return null
    return getProfileCompleteness(userProfile, apiRole)
  }, [userProfile, apiRole])

  const handleLogout = useCallback(() => {
    authService.logout()
    clearUserData()
    window.dispatchEvent(new CustomEvent('auth:logout'))
    showToast(t('auth.loggedOut'), 'success')
    window.location.reload()
  }, [clearUserData, showToast, t])
  const openEditDrawer = useCallback(() => {
    setIsEditDrawerOpen(true)
  }, [])

  const closeEditDrawer = useCallback(() => {
    setIsEditDrawerOpen(false)
  }, [])

  const handleEditSuccess = useCallback(() => {
    refetch()
  }, [refetch])

  const restaurantInfo = useMemo(() => {
    if (apiRole !== 'restaurant') return null
    return {
      name: userProfile?.full_name || userProfile?.name || t('venue'),
      format: null,
    }
  }, [apiRole, userProfile, t])

  const supplierInfo = useMemo(() => {
    if (apiRole !== 'supplier') return null
    return {
      name: userProfile?.full_name || userProfile?.name || t('company'),
    }
  }, [apiRole, userProfile, t])

  return {
    userProfile,
    isProfileLoading,
    refetch,

    apiRole,
    userName,
    roleLabel,
    specializations,
    employeeStats,

    myShifts,
    appliedShifts,

    myShiftsCount: myShifts.length,
    appliedShiftsCount: appliedShifts.length,

    profileCompleteness,

    isEditDrawerOpen,
    openEditDrawer,
    closeEditDrawer,
    handleEditSuccess,
    // exposed setter for compatibility with minimal safe cut
    setIsEditDrawerOpen,

    isNotificationPrefsDrawerOpen,
    setIsNotificationPrefsDrawerOpen,

    restaurantInfo,
    supplierInfo,

    handleLogout,
  } as const
}
