/**
 * API in-app уведомлений (инбокс).
 * Спецификация: NOTIFICATIONS_FRONTEND_SPEC.
 * Лёгкий `has_unread` — для polling индикатора; список — на экране уведомлений.
 */

import { api } from '@/shared/api/api'

export type NotificationType =
  | 'shift_created'
  | 'shift_applied'
  | 'shift_accepted'
  | 'shift_rejected'
  | 'shift_cancelled'
  | 'shift_completed'
  | 'application_cancelled'
  | 'review_received'
  | 'review_reminder'
  | 'system_message'

export type NotificationStatus = 'unread' | 'read' | 'archived'

export interface NotificationItem {
  id: number
  title: string
  message: string
  notification_type: NotificationType | string
  status: NotificationStatus
  created_at: string
  read_at: string | null
  notifiable_type: string | null
  notifiable_id: number | null
}

export interface NotificationsPagination {
  current_page?: number
  next_page?: number | null
  prev_page?: number | null
  total_pages?: number
  total_count?: number
  per_page?: number
}

export interface NotificationsListResponse {
  success: boolean
  data: NotificationItem[]
  pagination?: NotificationsPagination
  meta?: { has_unread?: boolean }
}

export interface HasUnreadResponse {
  success: boolean
  data: { has_unread: boolean }
}

export interface MarkAllReadResponse {
  success: boolean
  data: { updated: number }
}

export interface GetNotificationsParams {
  status?: NotificationStatus
  type?: NotificationType | string
  page?: number
  per_page?: number
}

/** Понизить has_unread-кэш до false, если в списке не осталось непрочитанных. */
const recomputeHasUnread = (items: NotificationItem[]): boolean =>
  items.some(item => item.status === 'unread')

export const notificationsApi = api.injectEndpoints({
  endpoints: builder => ({
    getNotifications: builder.query<NotificationsListResponse, GetNotificationsParams | void>({
      query: (params = {}) => ({
        url: '/api/v1/notifications',
        method: 'GET',
        params: params ?? {},
      }),
      providesTags: ['Notification'],
    }),

    getHasUnread: builder.query<HasUnreadResponse, void>({
      query: () => ({
        url: '/api/v1/notifications/has_unread',
        method: 'GET',
      }),
      providesTags: ['Notification'],
    }),

    markNotificationRead: builder.mutation<{ success: boolean }, number>({
      query: id => ({
        url: `/api/v1/notifications/${id}`,
        method: 'PATCH',
        body: { status: 'read' },
      }),
      // Оптимистично: помечаем запись прочитанной и пересчитываем индикатор.
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        let stillUnread = true
        const listPatch = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, draft => {
            const item = draft.data.find(notification => notification.id === id)
            if (item) item.status = 'read'
            stillUnread = recomputeHasUnread(draft.data)
            if (draft.meta) draft.meta.has_unread = stillUnread
          })
        )
        // Если это было последнее непрочитанное — гасим точку сразу.
        const unreadPatch = dispatch(
          notificationsApi.util.updateQueryData('getHasUnread', undefined, draft => {
            if (!stillUnread) draft.data.has_unread = false
          })
        )
        try {
          await queryFulfilled
        } catch {
          listPatch.undo()
          unreadPatch.undo()
        }
      },
    }),

    archiveNotification: builder.mutation<{ success: boolean }, number>({
      query: id => ({
        url: `/api/v1/notifications/${id}`,
        method: 'PATCH',
        body: { status: 'archived' },
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: builder.mutation<MarkAllReadResponse, void>({
      query: () => ({
        url: '/api/v1/notifications/mark_all_read',
        method: 'PATCH',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const listPatch = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, draft => {
            draft.data.forEach(item => {
              if (item.status === 'unread') item.status = 'read'
            })
            if (draft.meta) draft.meta.has_unread = false
          })
        )
        const unreadPatch = dispatch(
          notificationsApi.util.updateQueryData('getHasUnread', undefined, draft => {
            draft.data.has_unread = false
          })
        )
        try {
          await queryFulfilled
        } catch {
          listPatch.undo()
          unreadPatch.undo()
        }
      },
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useGetHasUnreadQuery,
  useMarkNotificationReadMutation,
  useArchiveNotificationMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi
