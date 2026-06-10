import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { groupByOrderedKeys } from '@/shared/utils/groupByOrderedKeys'
import {
  getOwnerShiftListingStatus,
  OWNER_LISTING_STATUS_LABEL_KEYS,
  type OwnerShiftListingStatus,
} from '@/shared/shifts/ownerShiftDisplay'

const OWNER_LISTING_STATUS_ORDER: OwnerShiftListingStatus[] = ['urgent', 'open', 'filled', 'closed']

export function groupOwnerByListingStatus(
  shifts: VacancyApiItem[]
): { status: OwnerShiftListingStatus; label: string; items: VacancyApiItem[] }[] {
  const grouped = groupByOrderedKeys(
    shifts,
    getOwnerShiftListingStatus,
    OWNER_LISTING_STATUS_ORDER,
    OWNER_LISTING_STATUS_LABEL_KEYS
  )

  return grouped.map(({ key, label, items }) => ({
    status: key,
    label,
    items,
  }))
}
