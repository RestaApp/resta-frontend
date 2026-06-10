import type { TFunction } from 'i18next'
import i18n from '@/shared/i18n/config'
import { parseApiDateTime, stripVacancyPrefix } from '@/shared/shifts/formatting'
import { isExpiredOwnerListing } from '@/shared/shifts/mapping'
import type { VacancyApiItem } from '@/services/api/shiftsApi'

const STALE_APPLICATIONS_HOURS = 3

export const OWNER_CLOSED_STATUSES = new Set(['completed', 'cancelled', 'canceled', 'closed'])

export type OwnerShiftListingStatus = 'open' | 'filled' | 'urgent' | 'closed'

export const OWNER_LISTING_STATUS_LABEL_KEYS: Record<OwnerShiftListingStatus, string> = {
  urgent: 'shift.urgentBadge',
  open: 'shift.statusOpen',
  filled: 'shift.statusFilled',
  closed: 'shift.statusClosed',
}

const resolveLocale = (): string => (i18n.language.startsWith('ru') ? 'ru-RU' : 'en-GB')

export const getOwnerListingStatusLabel = (status: OwnerShiftListingStatus, t: TFunction): string =>
  t(OWNER_LISTING_STATUS_LABEL_KEYS[status])

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
  if (status && OWNER_CLOSED_STATUSES.has(status)) return 'closed'
  if (status === 'filled') return 'filled'
  if (isExpiredOwnerListing(vacancy)) return 'closed'
  if (vacancy.urgent) return 'urgent'
  return 'open'
}

export const isInviteableOwnerListing = (vacancy: VacancyApiItem): boolean => {
  const status = getOwnerShiftListingStatus(vacancy)
  return status === 'open' || status === 'urgent'
}

export const isOpenForVenueKpi = (vacancy: VacancyApiItem): boolean => {
  const status = getOwnerShiftListingStatus(vacancy)
  return status === 'open' || status === 'urgent'
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
