import { useTranslation } from 'react-i18next'
import { SUPPORTED_LOCALES, type Locale } from '@/shared/i18n/config'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface LanguageToggleProps {
  currentLocale: string
  onLocaleChange: (locale: Locale) => void
}

export function LanguageToggle({ currentLocale, onLocaleChange }: LanguageToggleProps) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2">
      {SUPPORTED_LOCALES.map(locale => (
        <Button
          key={locale}
          type="button"
          onClick={() => onLocaleChange(locale)}
          variant={currentLocale === locale ? 'gradient' : 'ghost'}
          size="sm"
          className={cn(
            'px-3 py-1.5 rounded-lg',
            currentLocale !== locale && 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {t(locale === 'ru' ? 'localeRu' : 'localeEn')}
        </Button>
      ))}
    </div>
  )
}
