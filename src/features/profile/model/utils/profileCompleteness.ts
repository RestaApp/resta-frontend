import { useMemo } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { mapRoleFromApi } from '@/utils/roles'
import type { ApiRole } from '@/types'

type UserProfileLike = {
  phone?: string | null
  location?: string | null
  city?: string | null
  last_name?: string | null
  bio?: string | null
  work_experience_summary?: string | null
  profile_photo_url?: string | null
  photo_url?: string | null
  email?: string | null
  employee_profile?: {
    experience_years?: number | null
    open_to_work?: boolean | null
    skills?: string[]
  } | null
}

export const getProfileCompleteness = (userProfile: UserProfileLike, apiRole: ApiRole | null) => {
  const hasPhone = !!userProfile.phone
  const hasCity = !!(userProfile.location || userProfile.city)
  const hasLastName = apiRole === 'employee' ? !!userProfile.last_name : true
  const isFilled = hasPhone && hasCity && hasLastName

  // Доп. «реальная» заполненность профиля по полезной информации
  const hasBioOrSummary = !!(userProfile.bio?.trim() || userProfile.work_experience_summary?.trim())
  const hasPhoto = !!(userProfile.profile_photo_url || userProfile.photo_url)
  const hasEmail = !!userProfile.email
  const hasExperience = userProfile.employee_profile?.experience_years !== undefined

  const infoFlags = [hasBioOrSummary, hasPhoto, hasEmail, hasExperience]
  const infoTotal = infoFlags.length
  const infoCount = infoFlags.filter(Boolean).length
  const infoPercent = Math.round((infoCount / infoTotal) * 100)

  return {
    hasPhone,
    hasCity,
    hasLastName,
    isFilled,
    infoPercent,
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
