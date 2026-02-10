import { useTranslation } from 'react-i18next'
import { SUPPORTED_LOCALES, type Locale } from '@/shared/i18n/config'

interface LanguageToggleProps {
  currentLocale: string
  onLocaleChange: (locale: Locale) => void
}

export function LanguageToggle({ currentLocale, onLocaleChange }: LanguageToggleProps) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2">
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => onLocaleChange(locale)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentLocale === locale
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
        >
          {t(locale === 'ru' ? 'localeRu' : 'localeEn')}
        </button>
      ))}
    </div>
  )
}
