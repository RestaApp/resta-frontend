import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { SUPPORTED_LOCALES, type Locale } from '@/shared/i18n/config'

interface LanguageToggleProps {
  currentLocale: string
  onLocaleChange: (locale: Locale) => void
}

export function LanguageToggle({ currentLocale, onLocaleChange }: LanguageToggleProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [ru, en] = SUPPORTED_LOCALES
  const indicatorIndex = currentLocale === 'ru' ? 0 : 1
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const active = buttonRefs.current[indicatorIndex]
    const container = containerRef.current
    if (!active || !container) return
    const c = container.getBoundingClientRect()
    const r = active.getBoundingClientRect()
    setIndicator({ left: r.left - c.left, width: r.width })
  }, [currentLocale, indicatorIndex])

  const setRu = useCallback(() => onLocaleChange(ru), [onLocaleChange, ru])
  const setEn = useCallback(() => onLocaleChange(en), [onLocaleChange, en])

  return (
    <div
      ref={containerRef}
      className="relative inline-flex rounded-full border border-border bg-muted p-1"
    >
      <motion.div
        className="absolute bottom-1 top-1 rounded-full gradient-primary"
        initial={false}
        animate={{ left: indicator.left, width: indicator.width }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      <button
        ref={el => { buttonRefs.current[0] = el }}
        type="button"
        onClick={setRu}
        className={cn(
          'relative z-10 rounded-full px-3 py-1 text-sm font-medium transition-colors',
          currentLocale === 'ru' ? 'text-primary-foreground' : 'text-muted-foreground'
        )}
        aria-pressed={currentLocale === 'ru'}
        aria-label={t('localeRu')}
      >
        {t('localeRu')}
      </button>

      <button
        ref={el => { buttonRefs.current[1] = el }}
        type="button"
        onClick={setEn}
        className={cn(
          'relative z-10 rounded-full px-3 py-1 text-sm font-medium transition-colors',
          currentLocale === 'en' ? 'text-primary-foreground' : 'text-muted-foreground'
        )}
        aria-pressed={currentLocale === 'en'}
        aria-label={t('localeEn')}
      >
        {t('localeEn')}
      </button>
    </div>
  )
}
