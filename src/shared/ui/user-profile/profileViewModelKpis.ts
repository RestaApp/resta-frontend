import type { KpiItem } from '@/components/ui/kpi-row'
import type { UserData } from '@/services/api/authApi'
import { toFiniteNumberOrNull } from '@/shared/utils/number'
import type { BuildProfileViewModelParams, ProfileReviewSummary } from './profileViewModel.types'

const normalizeNumber = toFiniteNumberOrNull

const formatRating = (value: unknown) => {
  const rating = normalizeNumber(value)
  return rating != null && rating > 0 ? rating.toFixed(1) : '—'
}

const formatReviews = (value: unknown) => {
  const reviews = normalizeNumber(value)
  return reviews != null && reviews > 0 ? String(reviews) : '—'
}

export const buildReviewSummary = (userProfile: UserData): ProfileReviewSummary | null => {
  const rating = normalizeNumber(userProfile.average_rating)
  const reviews = normalizeNumber(userProfile.total_reviews)
  if ((rating == null || rating <= 0) && (reviews == null || reviews <= 0)) return null

  return {
    rating: rating != null && rating > 0 ? rating.toFixed(1) : '—',
    reviews: reviews != null && reviews > 0 ? String(reviews) : '0',
  }
}

export const buildKpis = ({
  t,
  apiRole,
  userProfile,
  completedShifts,
  myShiftsCount,
}: Pick<
  BuildProfileViewModelParams,
  't' | 'apiRole' | 'userProfile' | 'completedShifts' | 'myShiftsCount'
>): KpiItem[] => {
  const rating = normalizeNumber(userProfile.average_rating)
  const reviews = normalizeNumber(userProfile.total_reviews)
  const items: KpiItem[] = []

  if (apiRole === 'employee') {
    items.push({
      id: 'shifts',
      value: completedShifts,
      label: t('profile.kpi.shifts'),
    })
  }

  if (apiRole === 'restaurant') {
    items.push({
      id: 'created',
      value: myShiftsCount,
      label: t('profile.kpi.created'),
    })
  }

  items.push(
    {
      id: 'rating',
      value: formatRating(rating),
      label: t('profile.kpi.rating'),
      tone: rating != null && rating > 0 ? 'success' : 'muted',
    },
    {
      id: 'reviews',
      value: formatReviews(reviews),
      label: t('common.reviews5'),
      tone: reviews != null && reviews > 0 ? 'default' : 'muted',
    }
  )

  return items
}

export const buildAnalyticsKpis = ({
  t,
  profileViewsThisMonth,
  contactClicksThisMonth,
}: Pick<
  BuildProfileViewModelParams,
  't' | 'profileViewsThisMonth' | 'contactClicksThisMonth'
>): KpiItem[] => {
  // null/undefined = данные analytics/my не загружены → ряд не строим.
  // normalizeNumber(null) дал бы 0, поэтому отсекаем отсутствие явно.
  const views = profileViewsThisMonth == null ? null : normalizeNumber(profileViewsThisMonth)
  const clicks = contactClicksThisMonth == null ? null : normalizeNumber(contactClicksThisMonth)
  if (views == null && clicks == null) return []

  return [
    {
      id: 'profile-views',
      value: views ?? '—',
      label: t('profile.kpi.viewsThisMonth'),
      tone: views != null && views > 0 ? 'primary' : 'muted',
    },
    {
      id: 'contact-clicks',
      value: clicks ?? '—',
      label: t('profile.kpi.contactClicks'),
      tone: clicks != null && clicks > 0 ? 'default' : 'muted',
    },
  ]
}
