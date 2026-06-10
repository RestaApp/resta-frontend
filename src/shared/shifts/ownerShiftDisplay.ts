import i18n from '@/shared/i18n/config'
import { parseApiDateTime } from '@/shared/shifts/formatting'
import { isExpiredOwnerListing } from '@/shared/shifts/mapping'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { toLocationArray } from '@/shared/utils/location'
import { formatUserDisplayName } from '@/shared/utils/userDisplayName'
import { stripVacancyPrefix } from '@/components/ui/shift-card/shift-card-utils'

const STALE_APPLICATIONS_HOURS = 3

const CLOSED_STATUSES = new Set(['completed', 'cancelled', 'canceled', 'closed'])

export type OwnerShiftListingStatus = 'open' | 'filled' | 'urgent' | 'closed'

const resolveLocale = (): string => (i18n.language.startsWith('ru') ? 'ru-RU' : 'en-GB')

export const formatOwnerShiftScheduleLine = (
  startTime?: string | null,
  endTime?: string | null
): string => {
  const start = parseApiDateTime(startTime)
  const end = parseApiDateTime(endTime)
  if (!start) return ''

  const locale = resolveLocale()
  const datePart = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(start)
  if (!end) return datePart

  const timeFmt = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' })
  return `${datePart} • ${timeFmt.format(start)} – ${timeFmt.format(end)}`
}

export const getOwnerShiftSubtitle = (vacancy: VacancyApiItem): string => {
  const fromProfile = vacancy.user?.restaurant_profile?.name?.trim()
  if (fromProfile) return fromProfile

  const fromLocation = toLocationArray(vacancy.location)[0]
    ?.replace(/^Минск,\s*/i, '')
    .trim()
  if (fromLocation) return fromLocation

  const fromUser = formatUserDisplayName(vacancy.user)
  if (fromUser) return fromUser

  return vacancy.city?.trim() ?? ''
}

export const getOwnerShiftTitle = (
  vacancy: VacancyApiItem,
  positionLabel: string,
  specializationLabel?: string | null
): string => {
  const customTitle = vacancy.title?.trim()
  if (customTitle) return stripVacancyPrefix(customTitle)

  if (specializationLabel) return `${positionLabel} · ${specializationLabel}`
  return positionLabel
}

export const getOwnerShiftListingStatus = (vacancy: VacancyApiItem): OwnerShiftListingStatus => {
  const status = vacancy.status?.trim().toLowerCase()
  if (status && CLOSED_STATUSES.has(status)) return 'closed'
  if (status === 'filled') return 'filled'
  if (isExpiredOwnerListing(vacancy)) return 'closed'
  if (vacancy.urgent) return 'urgent'
  return 'open'
}

export const formatOwnerShiftLocationLine = (vacancy: VacancyApiItem): string => {
  const street = toLocationArray(vacancy.location)[0]
    ?.replace(/^Минск,\s*/i, '')
    .trim()
  const city = vacancy.city?.trim()

  if (street && city) return `${street}, ${city}`
  return street || city || ''
}

export const shouldShowStaleApplicationsAlert = (vacancy: VacancyApiItem): boolean => {
  const listingStatus = getOwnerShiftListingStatus(vacancy)
  if (listingStatus === 'closed' || listingStatus === 'filled') return false

  const count = vacancy.applications_count ?? 0
  if (count > 0) return false

  const createdAt = parseApiDateTime(vacancy.created_at)
  if (!createdAt) return false

  const hoursSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  return hoursSinceCreated >= STALE_APPLICATIONS_HOURS
}
