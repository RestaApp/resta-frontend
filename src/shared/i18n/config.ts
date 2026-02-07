/**
 * Конфигурация i18n для поддержки русского и английского языков.
 * Язык сохраняется в localStorage и восстанавливается при следующем запуске.
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { STORAGE_KEYS } from '@/constants/storage'
import ru from './locales/ru.json'
import en from './locales/en.json'

const resources = {
  ru: { translation: ru },
  en: { translation: en },
}

const defaultNS = 'translation'

export const SUPPORTED_LOCALES = ['ru', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

/** Языки Telegram, для которых показываем русский интерфейс */
const TELEGRAM_CODES_RU = ['ru', 'be', 'uk', 'kk']

/**
 * Преобразует код языка Telegram (например 'ru', 'en') в локаль приложения.
 */
export function telegramCodeToLocale(code: string | null): Locale {
  if (!code) return 'ru'
  const lower = code.toLowerCase().slice(0, 2)
  return TELEGRAM_CODES_RU.includes(lower) ? 'ru' : 'en'
}

function getSavedLocale(): Locale | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCALE)
    if (saved === 'ru' || saved === 'en') return saved
  } catch {
    // ignore
  }
  return null
}

i18n.use(initReactI18next).init({
  resources,
  lng: getSavedLocale() ?? 'ru',
  fallbackLng: 'ru',
  defaultNS,
  supportedLngs: SUPPORTED_LOCALES,
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng: string) => {
  if (typeof window === 'undefined') return
  const locale = lng.split('-')[0]
  if (locale === 'ru' || locale === 'en') {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCALE, locale)
    } catch {
      // ignore
    }
  }
})

export default i18n
