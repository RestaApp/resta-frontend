/**
 * Парсер ответа 402 Payment Required (PURCHASES_API_SPEC).
 * Бэк возвращает: { error, feature, upgrade_available, purchase_type, price }.
 */

export type PurchaseType = 'vacancy_slot' | 'replacement_slot' | 'urgent_boost'

export interface PaymentRequiredInfo {
  purchaseType: PurchaseType
  price: number
  /** Машинное имя действия, напр. 'create_vacancy' / 'use_urgent'. */
  feature?: string
  upgradeAvailable: boolean
}

const PURCHASE_TYPES: readonly PurchaseType[] = ['vacancy_slot', 'replacement_slot', 'urgent_boost']

const isPurchaseType = (value: unknown): value is PurchaseType =>
  typeof value === 'string' && (PURCHASE_TYPES as readonly string[]).includes(value)

/**
 * Извлекает информацию о покупке из ошибки RTK Query (`{ status, data }`).
 * Возвращает null, если это не 402 или нет валидного purchase_type.
 */
export const parsePaymentRequired = (error: unknown): PaymentRequiredInfo | null => {
  if (!error || typeof error !== 'object') return null
  const { status, data } = error as { status?: unknown; data?: unknown }
  if (status !== 402) return null
  if (!data || typeof data !== 'object') return null

  const body = data as {
    purchase_type?: unknown
    price?: unknown
    feature?: unknown
    upgrade_available?: unknown
  }
  if (!isPurchaseType(body.purchase_type)) return null

  return {
    purchaseType: body.purchase_type,
    price: typeof body.price === 'number' ? body.price : 0,
    ...(typeof body.feature === 'string' ? { feature: body.feature } : {}),
    upgradeAvailable: body.upgrade_available === true,
  }
}
