import type { NotificationItem } from '@/services/api/notificationsApi'

interface AppliedListingReference {
  id: number
  my_application?: { id: number } | null
}

export type NotificationNavigationTarget =
  | { type: 'shift'; shiftId: number }
  | { type: 'applications' }
  | null

const positiveId = (value: unknown): number | null => {
  const id = typeof value === 'string' ? Number(value) : value
  return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : null
}

const APPLICATION_DECISION_TYPES = new Set(['shift_accepted', 'shift_rejected'])

export const getNotificationNavigationTarget = (
  notification: NotificationItem,
  appliedListings: AppliedListingReference[]
): NotificationNavigationTarget => {
  const directShiftId = positiveId(notification.shift_id)
  if (directShiftId) return { type: 'shift', shiftId: directShiftId }

  if (notification.notifiable_type === 'Shift') {
    const shiftId = positiveId(notification.notifiable_id)
    return shiftId ? { type: 'shift', shiftId } : null
  }

  if (notification.notifiable_type === 'ShiftApplication') {
    const applicationId = positiveId(notification.notifiable_id)
    const listing = applicationId
      ? appliedListings.find(item => item.my_application?.id === applicationId)
      : undefined
    if (listing) return { type: 'shift', shiftId: listing.id }
  }

  return APPLICATION_DECISION_TYPES.has(notification.notification_type)
    ? { type: 'applications' }
    : null
}
