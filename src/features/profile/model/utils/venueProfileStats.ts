import type { ReceivedShiftApplicationApiItem, VacancyApiItem } from '@/services/api/shiftsApi'
import { isExpiredOwnerListing } from '@/shared/shifts/mapping'

const CLOSED_STATUSES = new Set(['completed', 'cancelled', 'canceled'])

export const isOpenVenueListing = (item: VacancyApiItem): boolean => {
  const status = item.status?.trim().toLowerCase()
  if (status && CLOSED_STATUSES.has(status)) return false
  return !isExpiredOwnerListing(item)
}

export const countOpenVenueListings = (items: VacancyApiItem[]): number =>
  items.filter(isOpenVenueListing).length

export const countAcceptedHires = (applications: ReceivedShiftApplicationApiItem[]): number =>
  applications.filter(application => {
    const status = (application.shift_application_status ?? application.status ?? '')
      .trim()
      .toLowerCase()
    return status === 'accepted'
  }).length
