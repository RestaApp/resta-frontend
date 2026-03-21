import { useMemo } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { mapRoleFromApi } from '@/utils/roles'
import { getProfileCompleteness, type UserProfileLike } from '../utils/profileCompleteness'

export const useProfileCompleteness = () => {
  const { userProfile } = useUserProfile()

  return useMemo(() => {
    if (!userProfile) {
      return {
        hasName: false,
        hasPhone: false,
        hasCity: false,
        hasLastName: false,
        isFilled: false,
        missing: [] as string[],
      }
    }

    const apiRole = userProfile.role ? mapRoleFromApi(userProfile.role) : null
    return getProfileCompleteness(userProfile as UserProfileLike, apiRole)
  }, [userProfile])
}
