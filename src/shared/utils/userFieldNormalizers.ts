import type { UserData } from '@/services/api/usersApi'

export const getUserPhotoUrl = (
  item: Pick<UserData, 'photo_url' | 'profile_photo_url'>
): string | null => {
  const raw = item.photo_url ?? item.profile_photo_url
  if (typeof raw !== 'string') return null
  const normalized = raw.trim()
  return normalized.length > 0 ? normalized : null
}

export const normalizeRating = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export const normalizeReviewsCount = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}
