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

/** GET /analytics/my — общая аналитика текущего пользователя (любая роль). */
export interface MyAnalyticsData {
  profile_views_count: number
  profile_views_this_month: number
  contact_clicks_this_month: number
}

export interface MyAnalyticsResponse {
  success: boolean
  data: MyAnalyticsData
}

/** Помесячный срез аналитики поставщика. `contact_clicks` содержит только типы с кликами. */
export interface SupplierAnalyticsMonth {
  total_views: number
  unique_viewers: number
  contact_clicks: Partial<Record<ContactType, number>>
  price_list_requests: number
  ctr: number
}

/**
 * GET /analytics/supplier — дашборд поставщика.
 * Поля `plan` / `analytics_locked` появятся после мержа monetization (ANALYTICS_MERGE_NOTES):
 * на FREE-плане дашборд блокируется, на PRO — открыт.
 */
export interface SupplierAnalyticsData {
  current_month: SupplierAnalyticsMonth
  previous_month: SupplierAnalyticsMonth
  all_time_views: number
  /** Имя плана поставщика (supplier_free / supplier_pro), если бэк его отдаёт. */
  plan?: string
  /** true → аналитика доступна только на PRO; показывать локап. */
  analytics_locked?: boolean
}

export interface SupplierAnalyticsResponse {
  success: boolean
  data: SupplierAnalyticsData
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

    // GET /analytics/my — KPI просмотров профиля и кликов по контактам за месяц.
    getMyAnalytics: builder.query<MyAnalyticsResponse, void>({
      query: () => ({
        url: '/api/v1/analytics/my',
        method: 'GET',
      }),
      providesTags: ['Analytics'],
      keepUnusedDataFor: 3600, // аналитику смотрят редко — держим час
    }),

    // GET /analytics/supplier — дашборд поставщика (доступ только supplier, иначе 403).
    getSupplierAnalytics: builder.query<SupplierAnalyticsResponse, void>({
      query: () => ({
        url: '/api/v1/analytics/supplier',
        method: 'GET',
      }),
      providesTags: ['Analytics'],
      keepUnusedDataFor: 3600,
    }),
  }),
})

export const { useTrackEventMutation, useGetMyAnalyticsQuery, useGetSupplierAnalyticsQuery } =
  analyticsApi
