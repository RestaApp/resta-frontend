import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserProfile } from '@/shared/lib/hooks/useUserProfile'
import {
  useGetMyShiftsQuery,
  useGetReceivedShiftApplicationsQuery,
  FULL_LIST_PER_PAGE,
} from '@/services/api/shiftsApi'
import { useGetMyAnalyticsQuery } from '@/services/api/analyticsApi'
import { buildVenueProfileInfoRows } from '../utils/buildVenueProfileInfoRows'
import { countAcceptedHires, countOpenVenueListings } from '../utils/venueProfileStats'
import { mapRoleFromApi } from '@/shared/utils/roles'
import type { ApiRole } from '@/shared/types/roles.types'
import { useLabels } from '@/shared/i18n/hooks'
import { normalizeVacanciesResponse } from '@/shared/shifts/normalizeShiftsResponse'
import { getProfileCompleteness } from '@/shared/utils/profileCompleteness'
import { formatProfileDisplayName } from '@/shared/utils/userDisplayName'
import { useAuth } from '@/app/contexts/auth'
import { buildProfileViewModel } from '@/shared/ui/user-profile/buildProfileViewModel'
import { getSupplierCategory, getSupplierProfile } from '@/shared/utils/supplierProfile'

/**
 * Data-слой профиля: загрузка профиля/смен/заявок/аналитики и сборка
 * `profileViewModel` + venue-метрик. Чистое чтение, без UI-state и actions.
 */
export const useProfileViewModelData = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const {
    getEmployeePositionLabel,
    getRestaurantFormatLabel,
    getCuisineTypeLabel,
    getSpecializationLabel,
    getSupplierTypeLabel,
  } = useLabels()
  const { userProfile, isLoading: isProfileLoading } = useUserProfile()

  const apiRole = useMemo<ApiRole | null>(() => {
    const roleValue = userProfile?.role
    if (!roleValue) return null
    return mapRoleFromApi(roleValue)
  }, [userProfile?.role])

  const { data: myShiftsData } = useGetMyShiftsQuery(undefined, {
    skip: !isAuthenticated,
  })

  const { data: receivedApplicationsData } = useGetReceivedShiftApplicationsQuery(
    { per_page: FULL_LIST_PER_PAGE },
    {
      skip: !isAuthenticated || apiRole !== 'restaurant',
    }
  )

  // KPI просмотров/кликов — только для своего профиля (GET /analytics/my).
  const { data: myAnalyticsData } = useGetMyAnalyticsQuery(undefined, {
    skip: !isAuthenticated,
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
      profileViewsThisMonth: myAnalyticsData?.data.profile_views_this_month ?? null,
      contactClicksThisMonth: myAnalyticsData?.data.contact_clicks_this_month ?? null,
      getSpecializationLabel,
      getSupplierTypeLabel,
      getRestaurantFormatLabel,
      getCuisineTypeLabel,
    })
  }, [
    apiRole,
    employeeStats.completedShifts,
    getSpecializationLabel,
    getSupplierTypeLabel,
    getRestaurantFormatLabel,
    getCuisineTypeLabel,
    myShifts.length,
    myAnalyticsData,
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
  }
}
