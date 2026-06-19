/**
 * API подписок (Telegram Stars). Спецификация: Frontend/SUBSCRIPTIONS_API_SPEC.
 * Только supplier может оформлять PRO. `current` отдаёт эффективный план,
 * запись подписки (если есть) и usage бесплатных лимитов (null при Flipper ON).
 */

import { api } from '@/shared/api/api'

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled' | 'renewed'

export interface PlanFeatures {
  analytics?: boolean
  badge?: boolean
  priority?: boolean
  price_list?: boolean
  new_restaurant_notifications?: boolean
}

export interface Plan {
  id?: number
  name: string
  role?: string
  subscription_price: number
  duration_days?: number | null
  features: PlanFeatures
  limits: Record<string, number>
}

export interface SubscriptionRecord {
  id: number
  status: SubscriptionStatus
  purchased_at: string
  expires_at: string | null
  days_remaining: number | null
}

export interface UsageEntry {
  used: number
  limit: number
  remaining: number
}

export type Usage = Record<string, UsageEntry>

export interface CurrentSubscriptionData {
  subscription: SubscriptionRecord | null
  plan: Plan
  usage: Usage | null
}

export interface CurrentSubscriptionResponse {
  success: boolean
  data: CurrentSubscriptionData
}

export interface SubscriptionCheckoutResponse {
  success: boolean
  data: { invoice_url: string }
}

export const subscriptionsApi = api.injectEndpoints({
  endpoints: builder => ({
    getCurrentSubscription: builder.query<CurrentSubscriptionResponse, void>({
      query: () => ({
        url: '/api/v1/subscriptions/current',
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    subscriptionCheckout: builder.mutation<SubscriptionCheckoutResponse, { plan_name: string }>({
      query: body => ({
        url: '/api/v1/subscriptions/checkout',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetCurrentSubscriptionQuery,
  useLazyGetCurrentSubscriptionQuery,
  useSubscriptionCheckoutMutation,
} = subscriptionsApi
