/**
 * Реестр тем контекстной справки («?»-хинты, #FAQ).
 * Контент — в i18n под `help.<topic>.*` (title/body/highlight/paid).
 * Здесь — только конфиг: что платное, есть ли хайлайт и визуальный превью.
 */
export type HelpTopic = 'urgent' | 'pro' | 'limits' | 'accept' | 'priceList' | 'analytics'

export interface HelpTopicConfig {
  /** Платная фича: блок `help.<topic>.paid` рендерится только при MONETIZATION_ENABLED. */
  paid?: boolean
  /** Есть строка-хайлайт `help.<topic>.highlight`. */
  highlight?: boolean
  /** Визуальный превью внутри хинта. */
  preview?: 'urgentCard'
}

export const HELP_TOPICS: Record<HelpTopic, HelpTopicConfig> = {
  urgent: { paid: true, highlight: true, preview: 'urgentCard' },
  pro: { paid: true, highlight: true },
  limits: {},
  accept: {},
  priceList: {},
  analytics: { paid: true },
}
