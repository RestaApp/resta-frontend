import type { ApplicationPreviewApiItem } from '@/services/api/shiftsApi'

const isPendingStaffApplication = (application: ApplicationPreviewApiItem): boolean => {
  const status = (application.shift_application_status ?? application.status ?? 'pending')
    .trim()
    .toLowerCase()
  return status === 'pending' || status === 'processing'
}

export const countPendingStaffApplications = (applications: ApplicationPreviewApiItem[]): number =>
  applications.filter(isPendingStaffApplication).length
