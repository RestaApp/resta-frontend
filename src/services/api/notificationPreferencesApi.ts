/**
 * API настроек уведомлений (Telegram).
 * Спецификация: GET/PATCH /api/v1/notification_preferences
 */

import { api } from '@/shared/api/api'

export interface NotificationPreference {
  id: number
  urgent_notifications: boolean
  new_shifts_notifications: boolean
  application_notifications: boolean
  all_enabled: boolean
  all_disabled: boolean
}

export interface NotificationPreferencesResponse {
  success: boolean
  data: NotificationPreference
}

/** Partial update — можно передать только изменяемые поля */
export interface UpdateNotificationPreferenceRequest {
  notification_preference: Partial<{
    urgent_notifications: boolean
    new_shifts_notifications: boolean
    application_notifications: boolean
  }>
}

export const notificationPreferencesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationPreferences: builder.query<NotificationPreferencesResponse, void>({
      query: () => ({
        url: '/api/v1/notification_preferences',
        method: 'GET',
      }),
      providesTags: ['Notification'],
    }),

    updateNotificationPreferences: builder.mutation<
      NotificationPreferencesResponse,
      UpdateNotificationPreferenceRequest
    >({
      query: (body) => ({
        url: '/api/v1/notification_preferences',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
})

export const {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationPreferencesApi
