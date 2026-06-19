/**
 * API аналитики. Спецификация: Frontend/ANALYTICS_API_SPEC.
 * Фронт обязан слать события контактов/прайс-листа (fire-and-forget, 204).
 */

import { api } from '@/shared/api/api'

export type ContactType = 'phone' | 'telegram' | 'email' | 'website'
export type AnalyticsEventType = 'contact_clicked' | 'price_list_requested'

export interface TrackEventArgs {
  event_type: AnalyticsEventType
  /** Сейчас фронт трекает только контакты пользователя. */
  trackable_type: 'User' | 'Shift'
  /** ID того, чей контакт/прайс запросили (НЕ текущий пользователь). */
  trackable_id: number
  metadata?: Record<string, unknown>
}

export const analyticsApi = api.injectEndpoints({
  endpoints: builder => ({
    // Бэкенд отвечает 204 — responseHandler 'text', чтобы не падать на пустом теле.
    trackEvent: builder.mutation<void, TrackEventArgs>({
      query: ({ metadata, ...rest }) => ({
        url: '/api/v1/analytics/track',
        method: 'POST',
        body: { ...rest, metadata: metadata ?? {} },
        responseHandler: 'text',
      }),
    }),
  }),
})

export const { useTrackEventMutation } = analyticsApi
