import type { ReceivedShiftApplicationApiItem, VacancyApiItem } from '@/services/api/shiftsApi'
import { isOpenForVenueKpi } from '@/shared/shifts/ownerShiftDisplay'

export const countOpenVenueListings = (items: VacancyApiItem[]): number =>
  items.filter(isOpenForVenueKpi).length

export const countAcceptedHires = (applications: ReceivedShiftApplicationApiItem[]): number =>
  applications.filter(application => {
    const status = (application.shift_application_status ?? application.status ?? '')
      .trim()
      .toLowerCase()
    return status === 'accepted'
  }).length
