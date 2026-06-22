/**
 * Реестр тем контекстной справки («?»-хинты, #FAQ).
 * Контент — в i18n под `help.<topic>.*` (title/body/highlight/paid).
 * Здесь — только конфиг: что платное, есть ли хайлайт, визуальный превью и
 * каким ролям тема релевантна (для фильтрации FAQ).
 */
import type { RoleCategory } from '@/shared/types/roles.types'

export type HelpTopic = 'urgent' | 'pro' | 'limits' | 'accept' | 'priceList' | 'analytics'

export interface HelpTopicConfig {
  /** Платная фича: блок `help.<topic>.paid` рендерится только при MONETIZATION_ENABLED. */
  paid?: boolean
  /** Есть строка-хайлайт `help.<topic>.highlight`. */
  highlight?: boolean
  /** Визуальный превью внутри хинта. */
  preview?: 'urgentCard'
  /** Роли, которым тема показывается в FAQ. */
  roles: RoleCategory[]
}

// Темы про смены: создание/буст/приём откликов — у тех, кто постит смены.
// employee создаёт замены, restaurant — вакансии и замены; оба бустят и принимают отклики.
const SHIFT_ROLES: RoleCategory[] = ['employee', 'restaurant']
// B2B-темы поставщика: PRO, прайс-лист, аналитика профиля.
const SUPPLIER_ROLES: RoleCategory[] = ['supplier']

export const HELP_TOPICS: Record<HelpTopic, HelpTopicConfig> = {
  urgent: { paid: true, highlight: true, preview: 'urgentCard', roles: SHIFT_ROLES },
  pro: { paid: true, highlight: true, roles: SUPPLIER_ROLES },
  limits: { roles: SHIFT_ROLES },
  accept: { roles: SHIFT_ROLES },
  priceList: { roles: SUPPLIER_ROLES },
  analytics: { paid: true, roles: SUPPLIER_ROLES },
}
