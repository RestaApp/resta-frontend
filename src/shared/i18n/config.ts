/**
 * Конфигурация i18n для поддержки русского и английского языков.
 * Язык сохраняется в localStorage и восстанавливается при следующем запуске.
 *
 * Русский словарь грузится синхронно (основная аудитория). Английский —
 * лениво отдельным чанком, чтобы не утяжелять стартовый бандл вторым словарём.
 * Любая смена языка должна идти через `setAppLanguage`, который сначала
 * догружает словарь, а затем переключает язык (без показа сырых ключей).
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { getLocalStorageItem, setLocalStorageItem } from '@/shared/utils/localStorage'
import ru from './locales/ru.json'

const defaultNS = 'translation'

export const SUPPORTED_LOCALES = ['ru', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

/** Языки Telegram, для которых показываем русский интерфейс */
const TELEGRAM_CODES_RU = ['ru', 'be', 'uk', 'kk']

/** Лоадеры лениво подгружаемых словарей (ru уже в бандле). */
const LAZY_LOCALE_LOADERS: Partial<
  Record<Locale, () => Promise<{ default: Record<string, unknown> }>>
> = {
  en: () => import('./locales/en.json'),
}

const loadedLocales = new Set<Locale>(['ru'])

async function ensureLocaleLoaded(locale: Locale): Promise<void> {
  if (loadedLocales.has(locale)) return
  const loader = LAZY_LOCALE_LOADERS[locale]
  if (!loader) return
  const module = await loader()
  i18n.addResourceBundle(locale, defaultNS, module.default, true, true)
  loadedLocales.add(locale)
}

/**
 * Преобразует код языка Telegram (например 'ru', 'en') в локаль приложения.
 */
export function telegramCodeToLocale(code: string | null): Locale {
  if (!code) return 'ru'
  const lower = code.toLowerCase().slice(0, 2)
  return TELEGRAM_CODES_RU.includes(lower) ? 'ru' : 'en'
}

function getSavedLocale(): Locale | null {
  const saved = getLocalStorageItem(STORAGE_KEYS.LOCALE)
  if (saved === 'ru' || saved === 'en') return saved
  return null
}

/** Единая точка смены языка: догружает словарь (если ленивый) и переключает. */
export async function setAppLanguage(locale: string): Promise<void> {
  const normalized = locale.split('-')[0]
  if (normalized !== 'ru' && normalized !== 'en') return
  await ensureLocaleLoaded(normalized)
  await i18n.changeLanguage(normalized)
}

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru } },
  lng: 'ru',
  fallbackLng: 'ru',
  defaultNS,
  supportedLngs: SUPPORTED_LOCALES,
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng: string) => {
  const locale = lng.split('-')[0]
  if (locale === 'ru' || locale === 'en') {
    setLocalStorageItem(STORAGE_KEYS.LOCALE, locale)
  }
})

// Если пользователь ранее выбрал английский — догружаем и переключаем.
const savedLocale = getSavedLocale()
if (savedLocale === 'en') {
  void setAppLanguage('en')
}

export default i18n
