import type { ApiRole } from '@/shared/types/roles.types'

export type UserProfileLike = {
  name?: string | null
  full_name?: string | null
  phone?: string | null
  location?: string[] | null
  city?: string | null
  last_name?: string | null
  bio?: string | null
  profile_photo_url?: string | null
  photo_url?: string | null
  email?: string | null
  website?: string | null
  business_hours?: Record<string, string> | null
  work_history?: unknown[] | null
  restaurant_profile?: {
    name?: string | null
    restaurant_format?: string | null
    cuisine_types?: string[] | null
  } | null
  supplier_profile?: {
    supplier_category?: string | null
    supplier_types?: string[] | null
    price_list_url?: string | null
  } | null
  employee_profile?: {
    experience_years?: number | null
    open_to_work?: boolean | null
    skills?: string[]
    position?: string | null
    specializations?: string[] | null
  } | null
}

export const getProfileCompleteness = (userProfile: UserProfileLike, apiRole: ApiRole | null) => {
  const venueName = userProfile.restaurant_profile?.name?.trim()
  const hasName =
    apiRole === 'restaurant'
      ? !!(venueName || userProfile.full_name?.trim() || userProfile.name?.trim())
      : !!(userProfile.name?.trim() || userProfile.full_name?.trim())
  const hasPhone = !!userProfile.phone
  const hasAnyLocation =
    Array.isArray(userProfile.location) && userProfile.location.some(line => line.trim().length > 0)
  const hasCity = hasAnyLocation || !!userProfile.city
  const hasLastName = apiRole === 'employee' ? !!userProfile.last_name : true
  // Контракт POST /shift_applications: для отклика обязательны только phone + city.
  // Остальные поля влияют на качество профиля, но не должны блокировать действие.
  const isActionReady = hasPhone && hasCity

  // Доп. «реальная» заполненность профиля по полезной информации
  const hasBio = !!userProfile.bio?.trim()
  const hasPhoto = !!(userProfile.profile_photo_url || userProfile.photo_url)
  const hasEmail = !!userProfile.email
  const hasValues = (values: string[] | null | undefined) =>
    Array.isArray(values) && values.some(value => value.trim().length > 0)
  const hasBusinessHours = Boolean(
    userProfile.business_hours &&
      Object.values(userProfile.business_hours).some(value => value.trim())
  )

  const completionFlags: boolean[] =
    apiRole === 'employee'
      ? [
          hasName,
          hasLastName,
          hasPhone,
          hasCity,
          hasPhoto,
          hasBio,
          hasEmail,
          Boolean(userProfile.employee_profile?.position?.trim()),
          hasValues(userProfile.employee_profile?.specializations),
          hasValues(userProfile.employee_profile?.skills),
          Boolean(userProfile.work_history?.length),
        ]
      : apiRole === 'restaurant'
        ? [
            hasName,
            hasPhone,
            hasCity,
            hasAnyLocation,
            hasPhoto,
            hasBio,
            hasEmail,
            Boolean(userProfile.website?.trim()),
            hasBusinessHours,
            Boolean(userProfile.restaurant_profile?.restaurant_format?.trim()),
            hasValues(userProfile.restaurant_profile?.cuisine_types),
          ]
        : apiRole === 'supplier'
          ? [
              hasName,
              hasPhone,
              hasCity,
              hasAnyLocation,
              hasPhoto,
              hasBio,
              hasEmail,
              Boolean(userProfile.website?.trim()),
              hasBusinessHours,
              Boolean(userProfile.supplier_profile?.supplier_category?.trim()),
              hasValues(userProfile.supplier_profile?.supplier_types),
              Boolean(userProfile.supplier_profile?.price_list_url?.trim()),
            ]
          : [hasName, hasPhone, hasCity, hasPhoto, hasBio, hasEmail]

  const completionPercent = Math.round(
    (completionFlags.filter(Boolean).length / completionFlags.length) * 100
  )

  return {
    hasName,
    hasPhone,
    hasCity,
    hasLastName,
    isActionReady,
    completionPercent,
    missing: [!hasPhone ? 'phone' : null, !hasCity ? 'city' : null].filter(Boolean) as string[],
  }
}
