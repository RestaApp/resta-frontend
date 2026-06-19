/**
 * API разовых покупок слотов (Telegram Stars). Спецификация: Frontend/PURCHASES_API_SPEC.
 * Рестораны/сотрудники. Покупка создаётся бэком только после успешной оплаты.
 */

import { api } from '@/shared/api/api'
import type { PurchaseType } from '@/shared/lib/monetization/paymentRequired'

export type { PurchaseType, PaymentRequiredInfo } from '@/shared/lib/monetization/paymentRequired'

export type PurchaseStatus = 'succeeded' | 'refunded'

export interface Purchase {
  id: number
  purchase_type: PurchaseType
  status: PurchaseStatus
  stars_paid: number
  consumed: boolean
  consumed_at: string | null
  created_at: string
}

export interface PurchasesResponse {
  success: boolean
  data: Purchase[]
}

export interface PurchaseCheckoutResponse {
  success: boolean
  data: { invoice_url: string }
}

export interface BoostShiftResponse {
  success: boolean
  data: { id: number; urgent: boolean; status: string }
}

export const purchasesApi = api.injectEndpoints({
  endpoints: builder => ({
    getPurchases: builder.query<PurchasesResponse, void>({
      query: () => ({
        url: '/api/v1/purchases',
        method: 'GET',
      }),
      providesTags: ['Purchase'],
    }),

    purchaseCheckout: builder.mutation<PurchaseCheckoutResponse, { purchase_type: PurchaseType }>({
      query: body => ({
        url: '/api/v1/purchases/checkout',
        method: 'POST',
        body,
      }),
    }),

    // PATCH /shifts/:id/boost — помечает смену срочной. 402 при Flipper ON.
    boostShift: builder.mutation<BoostShiftResponse, number>({
      query: id => ({
        url: `/api/v1/shifts/${id}/boost`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Shift', id }],
    }),
  }),
})

export const { useGetPurchasesQuery, usePurchaseCheckoutMutation, useBoostShiftMutation } =
  purchasesApi
