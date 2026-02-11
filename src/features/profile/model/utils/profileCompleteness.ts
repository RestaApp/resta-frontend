import { useMemo } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { mapRoleFromApi } from '@/utils/roles'
import type { ApiRole } from '@/types'

type UserProfileLike = {
  phone?: string | null
  location?: string | null
  city?: string | null
  last_name?: string | null
}

export const getProfileCompleteness = (userProfile: UserProfileLike, apiRole: ApiRole | null) => {
  const hasPhone = !!userProfile.phone
  const hasCity = !!(userProfile.location || userProfile.city)
  const hasLastName = apiRole === 'employee' ? !!userProfile.last_name : true

  const isFilled = hasPhone && hasCity && hasLastName

  return {
    hasPhone,
    hasCity,
    hasLastName,
    isFilled,
    missing: [
      !hasPhone ? 'phone' : null,
      !hasCity ? 'city' : null,
      apiRole === 'employee' && !hasLastName ? 'last_name' : null,
    ].filter(Boolean) as string[],
  }
}

export const useProfileCompleteness = () => {
  const { userProfile } = useUserProfile()

  return useMemo(() => {
    if (!userProfile) {
      return {
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
