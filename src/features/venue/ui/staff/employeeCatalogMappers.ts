import type { TFunction } from 'i18next'
import type { UserData } from '@/services/api/usersApi'
import { formatUserDisplayName } from '@/shared/utils/userDisplayName'
import {
  getUserPhotoUrl,
  normalizeRating,
  normalizeReviewsCount,
} from '@/shared/utils/userFieldNormalizers'
import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'
import type { EmployeeCatalogItem } from './employeeCatalogTypes'

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
