import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { isExpiredOwnerListing } from './mapping'

/** Only active listings allow moderation; filled listings still allow rejecting a hire. */
export const canModerateListingStatus = (status?: string | null): boolean =>
  status === 'open' || status === 'filled'

export const canModerateListing = (listing?: VacancyApiItem | null): boolean =>
  Boolean(listing && canModerateListingStatus(listing.status) && !isExpiredOwnerListing(listing))
