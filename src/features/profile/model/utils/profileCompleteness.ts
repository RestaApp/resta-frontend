import type { ApiRole } from '@/types'

export type UserProfileLike = {
  name?: string | null
  full_name?: string | null
  phone?: string | null
  location?: string | null
  city?: string | null
  last_name?: string | null
  bio?: string | null
  work_experience_summary?: string | null
  profile_photo_url?: string | null
  photo_url?: string | null
  email?: string | null
  restaurant_profile?: {
    name?: string | null
  } | null
  employee_profile?: {
    experience_years?: number | null
    open_to_work?: boolean | null
    skills?: string[]
  } | null
}

export const getProfileCompleteness = (userProfile: UserProfileLike, apiRole: ApiRole | null) => {
  const venueName = userProfile.restaurant_profile?.name?.trim()
  const hasName =
    apiRole === 'restaurant'
      ? !!(venueName || userProfile.full_name?.trim() || userProfile.name?.trim())
      : !!(userProfile.name?.trim() || userProfile.full_name?.trim())
  const hasPhone = !!userProfile.phone
  const hasCity = !!(userProfile.location || userProfile.city)
  const hasLastName = apiRole === 'employee' ? !!userProfile.last_name : true
  const isFilled = hasName && hasPhone && hasCity && hasLastName

  // Доп. «реальная» заполненность профиля по полезной информации
  const hasBioOrSummary = !!(userProfile.bio?.trim() || userProfile.work_experience_summary?.trim())
  const hasPhoto = !!(userProfile.profile_photo_url || userProfile.photo_url)
  const hasEmail = !!userProfile.email
  const experienceYears = userProfile.employee_profile?.experience_years
  const hasExperience = typeof experienceYears === 'number' && Number.isFinite(experienceYears)
  /** Для заведений/поставщиков стаж не применим — учитываем адрес (location), как в форме профиля */
  const hasBusinessLocation = !!userProfile.location?.trim()

  const infoFlags: boolean[] =
    apiRole === 'employee'
      ? [hasBioOrSummary, hasPhoto, hasEmail, hasExperience]
      : apiRole === 'restaurant' || apiRole === 'supplier'
        ? [hasBioOrSummary, hasPhoto, hasEmail, hasBusinessLocation]
        : [hasBioOrSummary, hasPhoto, hasEmail]

  const infoTotal = infoFlags.length
  const infoCount = infoFlags.filter(Boolean).length
  const infoPercent = infoTotal > 0 ? Math.round((infoCount / infoTotal) * 100) : 0

  return {
    hasName,
    hasPhone,
    hasCity,
    hasLastName,
    isFilled,
    infoPercent,
    missing: [
      !hasName ? 'name' : null,
      !hasPhone ? 'phone' : null,
      !hasCity ? 'city' : null,
      apiRole === 'employee' && !hasLastName ? 'last_name' : null,
    ].filter(Boolean) as string[],
  }
}
