import { describe, expect, it } from 'vitest'
import type { NotificationItem } from '@/services/api/notificationsApi'
import { getNotificationNavigationTarget } from './notificationNavigation'

const notification = (overrides: Partial<NotificationItem>): NotificationItem => ({
  id: 1,
  title: 'Заявка принята',
  message: '',
  notification_type: 'shift_accepted',
  status: 'unread',
  created_at: '2026-08-12T12:00:00Z',
  read_at: null,
  notifiable_type: 'ShiftApplication',
  notifiable_id: 77,
  ...overrides,
})

describe('getNotificationNavigationTarget', () => {
  it.each(['shift_accepted', 'shift_rejected'])(
    'открывает детали для уведомления %s с shift_id',
    notificationType => {
      expect(
        getNotificationNavigationTarget(
          notification({ notification_type: notificationType, shift_id: 42 }),
          []
        )
      ).toEqual({ type: 'shift', shiftId: 42 })
    }
  )

  it('восстанавливает shift id старого уведомления по application id', () => {
    expect(
      getNotificationNavigationTarget(notification({ shift_id: null }), [
        { id: 42, my_application: { id: 77 } },
      ])
    ).toEqual({ type: 'shift', shiftId: 42 })
  })

  it('направляет в мои отклики, если связь старого уведомления уже недоступна', () => {
    expect(getNotificationNavigationTarget(notification({ shift_id: null }), [])).toEqual({
      type: 'applications',
    })
  })
})
