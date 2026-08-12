import { useMemo } from 'react'
import { useUserProfile } from '@/shared/lib/hooks/useUserProfile'
import { mapRoleFromApi } from '@/shared/utils/roles'
import { getProfileCompleteness, type UserProfileLike } from '@/shared/utils/profileCompleteness'

export const useProfileCompleteness = () => {
  const { userProfile } = useUserProfile()

  return useMemo(() => {
    if (!userProfile) {
      return {
        hasName: false,
        hasPhone: false,
        hasCity: false,
        hasLastName: false,
        isActionReady: false,
        completionPercent: 0,
        missing: [] as string[],
      }
    }

    const apiRole = userProfile.role ? mapRoleFromApi(userProfile.role) : null
    return getProfileCompleteness(userProfile as UserProfileLike, apiRole)
  }, [userProfile])
}
