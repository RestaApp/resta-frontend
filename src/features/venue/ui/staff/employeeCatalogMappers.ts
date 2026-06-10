import type { TFunction } from 'i18next'
import type { UserData } from '@/services/api/usersApi'
import { formatUserDisplayName } from '@/shared/utils/userDisplayName'
import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'
import type { EmployeeCatalogItem } from './employeeCatalogTypes'

const getUserPhotoUrl = (item: Pick<UserData, 'photo_url' | 'profile_photo_url'>): string | null => {
  const raw = item.photo_url ?? item.profile_photo_url
  if (typeof raw !== 'string') return null
  const normalized = raw.trim()
  return normalized.length > 0 ? normalized : null
}

const normalizeRating = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const normalizeReviewsCount = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export const mapEmployeeUsersToItems = (
  users: UserData[],
  t: TFunction,
  getEmployeePositionLabel: (value: string) => string
): EmployeeCatalogItem[] =>
  users.map(item => {
    const profile = item.employee_profile
    const positionKey = profile?.position ?? item.position ?? null
    const specializationKeys = [
      ...(profile?.specializations ?? []),
      ...(item.specialization ? [item.specialization] : []),
    ].filter((value, index, list) => value && list.indexOf(value) === index)

    return {
      id: item.id,
      name: formatUserDisplayName(item, t('common.user')),
      position: positionKey
        ? getEmployeePositionLabel(positionKey)
        : t('venueUi.staff.noPosition', { defaultValue: 'Без позиции' }),
      positionKey,
      specializationKeys,
      city: item.city?.trim() || '',
      experienceYears:
        typeof profile?.experience_years === 'number'
          ? profile.experience_years
          : typeof item.experience_years === 'number'
            ? item.experience_years
            : null,
      averageRating: normalizeRating(item.average_rating),
      totalReviews: normalizeReviewsCount(item.total_reviews),
      photoUrl: getUserPhotoUrl(item),
    }
  })

export const mapEmployeeCatalogItemToApplicationPreview = (
  employee: EmployeeCatalogItem
): ApplicationPreviewApiItem => ({
  user_id: employee.id,
  full_name: employee.name,
  position: employee.positionKey ?? undefined,
  specializations: employee.specializationKeys,
  average_rating: employee.averageRating,
  total_reviews: employee.totalReviews,
  experience_years: employee.experienceYears ?? undefined,
  user: {
    id: employee.id,
    full_name: employee.name,
    photo_url: employee.photoUrl,
    profile_photo_url: employee.photoUrl,
    city: employee.city || undefined,
    position: employee.positionKey ?? undefined,
    average_rating: employee.averageRating,
    total_reviews: employee.totalReviews,
    employee_profile: {
      position: employee.positionKey ?? undefined,
      experience_years: employee.experienceYears ?? undefined,
      specializations: employee.specializationKeys,
    },
  },
})
