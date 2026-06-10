import type { VacancyApiItem } from '@/services/api/shiftsApi'
import {
  getOwnerShiftListingStatus,
  type OwnerShiftListingStatus,
} from '@/shared/shifts/ownerShiftDisplay'

const OWNER_LISTING_STATUS_ORDER: OwnerShiftListingStatus[] = ['urgent', 'open', 'filled', 'closed']

const OWNER_LISTING_STATUS_LABEL_KEYS: Record<OwnerShiftListingStatus, string> = {
  urgent: 'shift.urgentBadge',
  open: 'shift.statusOpen',
  filled: 'shift.statusFilled',
  closed: 'shift.statusClosed',
}

export function groupOwnerByListingStatus(
  shifts: VacancyApiItem[]
): { status: OwnerShiftListingStatus; label: string; items: VacancyApiItem[] }[] {
  const groups: Partial<Record<OwnerShiftListingStatus, VacancyApiItem[]>> = {}

  for (const shift of shifts) {
    const status = getOwnerShiftListingStatus(shift)
    if (!groups[status]) groups[status] = []
    groups[status]!.push(shift)
  }

  return OWNER_LISTING_STATUS_ORDER.filter(status => groups[status]?.length).map(status => ({
    status,
    label: OWNER_LISTING_STATUS_LABEL_KEYS[status],
    items: groups[status] ?? [],
  }))
}
