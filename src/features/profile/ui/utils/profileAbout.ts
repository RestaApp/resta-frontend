import type { TFunction } from 'i18next'
import type { ApiRole } from '@/types'

export function getProfileAboutTitle(t: TFunction, apiRole: ApiRole | null) {
  if (apiRole === 'restaurant') return t('common.aboutVenue')
  if (apiRole === 'supplier') return t('profile.aboutCompany')
  return t('profile.about')
}

export function getProfileAboutText(
  userProfile:
    | {
        bio?: string | null
        work_experience_summary?: string | null
      }
    | null
    | undefined
) {
  if (!userProfile) return ''
  const bio = userProfile.bio?.trim()
  if (bio) return bio
  const summary = userProfile.work_experience_summary?.trim()
  return summary || ''
}
