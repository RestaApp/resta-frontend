import type {
  ApplicationPreviewApiItem,
  ReceivedShiftApplicationApiItem,
} from '@/services/api/shiftsApi'
import type { StaffItem } from './VenueStaffList'

const isPendingStaffApplication = (application: ApplicationPreviewApiItem): boolean => {
  const status = (application.shift_application_status ?? application.status ?? 'pending')
    .trim()
    .toLowerCase()
  return status === 'pending' || status === 'processing'
}

export const countPendingStaffApplications = (applications: ApplicationPreviewApiItem[]): number =>
  applications.filter(isPendingStaffApplication).length

export const mapStaffApplicationsToItems = (
  applications: ReceivedShiftApplicationApiItem[]
): StaffItem[] => {
  const list: StaffItem[] = []

  for (const application of applications) {
    const applicationId = application.shift_application_id ?? application.id
    if (!applicationId) continue

    list.push({
      shiftId: application.shift_id ?? 0,
      shiftTitle: application.shift_title ?? '',
      applicationId,
      applicationStatus: application.shift_application_status ?? application.status ?? 'pending',
      person: application,
    })
  }

  return list
}

export const findStaffItem = (
  items: StaffItem[],
  selection: { applicationId: number | null; shiftId: number; userId: number }
): StaffItem | null =>
  items.find(
    candidate =>
      candidate.shiftId === selection.shiftId &&
      (candidate.applicationId === selection.applicationId ||
        candidate.person.shift_application_id === selection.applicationId ||
        candidate.person.id === selection.applicationId)
  ) ??
  items.find(
    candidate =>
      candidate.shiftId === selection.shiftId &&
      (candidate.person.user_id === selection.userId ||
        candidate.person.user?.id === selection.userId)
  ) ??
  null
