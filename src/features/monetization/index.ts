/**
 * Публичный API фичи `monetization` (cross-feature точка входа).
 *
 * `monetization` — ПУБЛИЧНАЯ фича (наряду с `navigation`): другие фичи импортируют
 * её поверхности ТОЛЬКО отсюда. Глубокие импорты в `features/monetization/**`
 * из других фич запрещены (см. `.cursorrules`).
 *
 * Здесь — ровно потребляемая снаружи поверхность. Внутренние модули
 * (`useSubscriptionCheckout` и т.п.) намеренно НЕ экспортируются — публичный
 * API держим узким.
 */
export { PurchaseFlowProvider } from './ui/PurchaseFlowProvider'
export { SubscriptionCard } from './ui/SubscriptionCard'
export { SupplierAnalyticsCard } from './ui/SupplierAnalyticsCard'
export { UpgradeProDrawer } from './ui/UpgradeProDrawer'
export { useSupplierSubscription } from './model/useSupplierSubscription'
