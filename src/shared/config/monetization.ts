/**
 * Фронт-флаг «спящего режима» монетизации. Фронт не читает Flipper бэка,
 * поэтому проактивный UI (карточка PRO, индикатор лимитов) прячется за этим
 * флагом. Покупки слотов реагируют на реальный 402 независимо от него.
 */
export const MONETIZATION_ENABLED = import.meta.env.VITE_MONETIZATION === 'true'

/** PRO-план поставщика. В спеках нет list-plans эндпоинта — значения из MONETIZATION.md. */
export const SUPPLIER_PRO_PLAN = {
  planName: 'supplier_pro',
  /** Цена в Telegram Stars/мес. TODO: заменить на значение из API, когда появится. */
  priceStars: 750,
} as const
