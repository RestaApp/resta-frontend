import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUserQuery } from '@/services/api/usersApi'
import { mapRoleFromApi } from '@/shared/utils/roles'
import { buildProfileViewModel } from '@/features/profile/model/buildProfileViewModel'
import { ProfileOverview } from '@/features/profile/ui/components/ProfileOverview'
import { useLabels } from '@/shared/i18n/hooks'
import { Loader } from '@/components/ui/loader'
import { getProfileCompleteness } from '@/shared/utils/profileCompleteness'
import { DetailsScreenFrame } from '@/shared/ui/shift-details-screen/DetailsScreenFrame'

interface UserProfileOverlayProps {
  id: number
  onClose: () => void
}

export function UserProfileOverlay({ id, onClose }: UserProfileOverlayProps) {
  const { t } = useTranslation()
  const {
    getUiRoleLabel,
    getEmployeePositionLabel,
    getRestaurantFormatLabel,
    getSpecializationLabel,
    getSupplierTypeLabel,
  } = useLabels()

  const { data: userResponse, isLoading, isError } = useGetUserQuery(id)

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

  const userName = useMemo(() => {
    if (!userProfile) return ''
    if (apiRole === 'restaurant') {
      const venue = userProfile.restaurant_profile?.name?.trim()
      if (venue) return venue
    }
    return (
      userProfile.full_name?.trim() ||
      [userProfile.name, userProfile.last_name].filter(Boolean).join(' ').trim() ||
      userProfile.username ||
      t('common.user')
    )
  }, [userProfile, apiRole, t])

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

  return (
    <DetailsScreenFrame
      variant="page"
      open
      onOpenChange={open => {
        if (!open) onClose()
      }}
      onClose={onClose}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" />
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-muted-foreground">{t('errors.loadError')}</div>
      ) : profileViewModel ? (
        <ProfileOverview profile={profileViewModel} variant="drawer" />
      ) : null}
    </DetailsScreenFrame>
  )
}
