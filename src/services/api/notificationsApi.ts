/**
 * In-app уведомления REST (не путать с PATCH /notification_preferences — Telegram).
 * Спецификация: resources :notifications в routes.rb
 */

import { api } from '@/shared/api/api'
import type { PaginationMeta } from './shiftsApi.types'

export interface NotificationApi {
  id: number
  title: string
  message: string
  notification_type: string
  status: string
  created_at?: string
  read_at?: string | null
  notifiable_type?: string | null
  notifiable_id?: number | null
}

export interface GetNotificationsParams {
  page?: number
  per_page?: number
  type?: string
  status?: string
}

export interface NotificationsListResponse {
  success: boolean
  data: NotificationApi[]
  pagination?: PaginationMeta
  meta?: { has_unread?: boolean }
}

export interface NotificationItemResponse {
  success: boolean
  data: NotificationApi
}

export interface NotificationsHasUnreadResponse {
  success: boolean
  data: { has_unread: boolean }
}

export interface MarkAllNotificationsReadResponse {
  success: boolean
  data?: { updated?: number }
}

export const notificationsApi = api.injectEndpoints({
  endpoints: builder => ({
    getNotifications: builder.query<NotificationsListResponse, GetNotificationsParams | void>({
      query: params => ({
        url: '/api/v1/notifications',
        params: params ?? {},
      }),
      providesTags: result =>
        result?.data?.length
          ? [
              { type: 'Notification' as const, id: 'LIST' },
              ...result.data.map(n => ({ type: 'Notification' as const, id: String(n.id) })),
            ]
          : [{ type: 'Notification' as const, id: 'LIST' }],
    }),

    getNotification: builder.query<NotificationItemResponse, number>({
      query: id => `/api/v1/notifications/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Notification', id: String(id) }],
    }),

    /** PATCH /notifications/:id — тело { status: 'read' | 'archived' } (корень JSON, как в спеке контроллера) */
    updateNotification: builder.mutation<
      NotificationItemResponse,
      { id: number; status: 'read' | 'archived' }
    >({
      query: ({ id, status }) => ({
        url: `/api/v1/notifications/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Notification', id: String(id) },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_FLAG' },
      ],
    }),

    markAllNotificationsRead: builder.mutation<MarkAllNotificationsReadResponse, void>({
      query: () => ({
        url: '/api/v1/notifications/mark_all_read',
        method: 'PATCH',
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_FLAG' },
      ],
    }),

    getNotificationsHasUnread: builder.query<NotificationsHasUnreadResponse, void>({
      query: () => '/api/v1/notifications/has_unread',
      providesTags: [{ type: 'Notification', id: 'UNREAD_FLAG' }],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useGetNotificationQuery,
  useUpdateNotificationMutation,
  useMarkAllNotificationsReadMutation,
  useGetNotificationsHasUnreadQuery,
} = notificationsApi
