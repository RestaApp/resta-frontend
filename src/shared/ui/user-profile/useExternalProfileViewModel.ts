import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUserQuery } from '@/services/api/usersApi'
import { mapRoleFromApi } from '@/shared/utils/roles'
import { useLabels } from '@/shared/i18n/hooks'
import { getProfileCompleteness } from '@/shared/utils/profileCompleteness'
import { formatProfileDisplayName } from '@/shared/utils/userDisplayName'
import { buildProfileViewModel, type ProfileViewModel } from './buildProfileViewModel'
import type { ApiRole } from '@/shared/types/roles.types'

interface UseExternalProfileViewModelOptions {
  userId: number | null | undefined
  skip?: boolean
}

interface UseExternalProfileViewModelResult {
  profileViewModel: ProfileViewModel | null
  apiRole: ApiRole | null
  isLoading: boolean
  isError: boolean
  drawerTitle: string
}

export const useExternalProfileViewModel = ({
  userId,
  skip = false,
}: UseExternalProfileViewModelOptions): UseExternalProfileViewModelResult => {
  const { t } = useTranslation()
  const {
    getUiRoleLabel,
    getEmployeePositionLabel,
    getRestaurantFormatLabel,
    getSpecializationLabel,
    getSupplierTypeLabel,
  } = useLabels()

  const effectiveSkip = skip || userId == null || userId === 0

  const {
    data: userResponse,
    isLoading,
    isError,
  } = useGetUserQuery(userId ?? 0, {
    skip: effectiveSkip,
  })

  const userProfile = userResponse?.data

  const apiRole = useMemo(
    () => (userProfile ? mapRoleFromApi(userProfile.role) : null),
    [userProfile]
  )

  const roleLabel = useMemo(
    () => (apiRole ? getUiRoleLabel(apiRole) : ''),
    [apiRole, getUiRoleLabel]
  )

  const positionLabel = (() => {
    if (apiRole !== 'employee' || !userProfile?.employee_profile?.position) return null
    return getEmployeePositionLabel(userProfile.employee_profile.position)
  })()

  const heroRoleOrPositionLabel = positionLabel ?? roleLabel

  const userName = useMemo(
    () => formatProfileDisplayName(userProfile, apiRole, t('common.user')),
    [userProfile, apiRole, t]
  )

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
      roleLabel: heroRoleOrPositionLabel,
      completeness: profileCompleteness,
      completedShifts: 0,
      myShiftsCount: 0,
      getSpecializationLabel,
      getSupplierTypeLabel,
      getRestaurantFormatLabel,
    })
  }, [
    apiRole,
    getRestaurantFormatLabel,
    getSpecializationLabel,
    getSupplierTypeLabel,
    heroRoleOrPositionLabel,
    profileCompleteness,
    t,
    userName,
    userProfile,
  ])

  const drawerTitle =
    apiRole === 'restaurant'
      ? t('roles.venueInfoTitle')
      : apiRole === 'supplier'
        ? t('roles.supplierInfoTitle')
        : t('profile.personalInfo')

  return {
    profileViewModel,
    apiRole,
    isLoading,
    isError,
    drawerTitle,
  }
}
