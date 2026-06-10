const REQUIREMENT_LINE_PREFIX = /^[\s•\-–*]+\s*|^\d+[.)]\s*/

export const parseRequirementLines = (text: string): string[] =>
  text
    .split(/\r?\n+/)
    .map(line => line.replace(REQUIREMENT_LINE_PREFIX, '').trim())
    .filter(Boolean)

export const normalizeDuration = (duration?: string | null): string | null => {
  const value = duration?.trim().replace(/\.$/, '') ?? ''
  return value || null
}

export const extractDurationHours = (duration?: string | null): number | null => {
  const value = normalizeDuration(duration)
  if (!value) return null
  const match = value.match(/(\d+(?:[.,]\d+)?)/)
  if (!match) return null
  const parsed = Number(match[1].replace(',', '.'))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export const formatOwnerRating = (rating?: number | null): string | null => {
  if (rating == null || !Number.isFinite(rating) || rating <= 0) return null
  return rating.toFixed(1)
}

export const formatOwnerReviewsCount = (reviews?: number | null): number | null => {
  if (reviews == null || !Number.isFinite(reviews) || reviews < 0) return null
  return Math.round(reviews)
}

export const splitLocationLines = (
  locationPoints: string[],
  city?: string | null
): { street: string; city: string | null } => {
  const rawLocation = locationPoints[0] ?? ''
  if (!rawLocation) {
    return { street: city?.trim() ?? '', city: null }
  }

  const withoutCityPrefix = rawLocation.replace(/^Минск,\s*/i, '').trim()
  const resolvedCity = city?.trim() || null

  if (resolvedCity && withoutCityPrefix.toLowerCase() === resolvedCity.toLowerCase()) {
    return { street: withoutCityPrefix, city: null }
  }

  return { street: withoutCityPrefix || rawLocation.trim(), city: resolvedCity }
}
