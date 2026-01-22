import { useCallback, useEffect, useMemo, useState } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUser } from '@/hooks/useUser'
import { useToast } from '@/hooks/useToast'
import { useGetMyShiftsQuery, useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import { mapRoleFromApi } from '@/utils/roles'
import type { ApiRole } from '@/types'
import { authService } from '@/services/auth'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { getEmployeePositionLabel } from '@/constants/labels'
import { normalizeVacanciesResponse } from '../utils/normalizeShiftsResponse'
import { getProfileCompleteness } from '../utils/profileCompleteness'

export const useProfilePageModel = () => {
  const { userProfile, isLoading: isProfileLoading, refetch } = useUserProfile()
  const { clearUserData } = useUser()
  const { showToast } = useToast()

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)

  // legacy: open drawer by localStorage flag
  useEffect(() => {
    const shouldOpenEdit = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT)
    if (shouldOpenEdit === 'true') {
      setIsEditDrawerOpen(true)
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

  // ВАЖНО: тут нужно договориться о типе API.
  // Сейчас useGetMyShiftsQuery типизирован как ShiftApi[], но UI использует start_time.
  // В рамках "без риска" — нормализуем как unknown -> VacancyApiItem[] через helper (как делали ранее).
  const myShifts = useMemo(() => normalizeVacanciesResponse(myShiftsData), [myShiftsData])
  const appliedShifts = useMemo(() => normalizeVacanciesResponse(appliedShiftsData), [appliedShiftsData])

  const apiRole = useMemo<ApiRole | null>(() => {
    if (!userProfile?.role) return null
    return mapRoleFromApi(userProfile.role)
  }, [userProfile?.role])

  const userName = useMemo(() => {
    if (!userProfile) return 'Пользователь'
    return userProfile.full_name || userProfile.name || 'Пользователь'
  }, [userProfile])

  const roleLabel = useMemo(() => {
    if (!userProfile) return 'Пользователь'
    if (apiRole === 'employee') {
      const position = userProfile.position || userProfile.employee_profile?.position
      return position ? getEmployeePositionLabel(position) : 'Сотрудник HoReCa'
    }
    if (apiRole === 'restaurant') return 'Ресторатор'
    if (apiRole === 'supplier') return 'Поставщик'
    return 'Пользователь'
  }, [apiRole, userProfile])

  const specializations = useMemo(() => {
    if (apiRole !== 'employee') return []
    return userProfile?.employee_profile?.specializations || []
  }, [apiRole, userProfile])

  const employeeStats = useMemo(() => {
    const completedShifts = myShifts.filter(s => {
      if (!s.start_time) return false
      return new Date(s.start_time) < new Date()
    }).length

    const activeApplications = appliedShifts.filter(s => {
      const a = s.my_application
      return a && a.status !== 'rejected' && a.status !== 'cancelled'
    }).length

    return { completedShifts, activeApplications }
  }, [myShifts, appliedShifts])

  const profileCompleteness = useMemo(() => {
    if (!userProfile) return null
    return getProfileCompleteness(userProfile as any, apiRole)
  }, [userProfile, apiRole])

  const handleLogout = useCallback(() => {
    authService.logout()
    clearUserData()
    window.dispatchEvent(new CustomEvent('auth:logout'))
    showToast('Вы вышли из аккаунта', 'success')
    window.location.reload()
  }, [clearUserData, showToast])
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
      name: userProfile?.full_name || userProfile?.name || 'Заведение',
      format: null,
    }
  }, [apiRole, userProfile])

  const supplierInfo = useMemo(() => {
    if (apiRole !== 'supplier') return null
    return {
      name: userProfile?.full_name || userProfile?.name || 'Компания',
    }
  }, [apiRole, userProfile])

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

    restaurantInfo,
    supplierInfo,

    handleLogout,
  } as const
}
