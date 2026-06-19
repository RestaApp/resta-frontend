import { createContext, useContext } from 'react'
import type { PaymentRequiredInfo } from '@/shared/lib/monetization/paymentRequired'

export interface PurchaseFlowContextValue {
  /** Открывает drawer покупки. Резолвит true, если оплачено (действие можно повторить). */
  requestPurchase: (info: PaymentRequiredInfo) => Promise<boolean>
}

export const PurchaseFlowContext = createContext<PurchaseFlowContextValue | null>(null)

/**
 * Доступ к flow покупки слота. Вне провайдера деградирует мягко
 * (`requestPurchase` → false), чтобы исходное действие отработало штатную ошибку.
 */
export function usePurchaseFlow(): PurchaseFlowContextValue {
  const ctx = useContext(PurchaseFlowContext)
  if (ctx) return ctx
  return { requestPurchase: () => Promise.resolve(false) }
}
