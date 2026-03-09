import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/utils/cn'
import { SUPPORTED_LOCALES, type Locale } from '@/shared/i18n/config'
import {
  SEGMENTED_CONTAINER_CLASS,
  SEGMENTED_INDICATOR_CLASS,
  SEGMENTED_TRIGGER_ACTIVE_CLASS,
  SEGMENTED_TRIGGER_CLASS,
  SEGMENTED_TRIGGER_INACTIVE_CLASS,
} from '@/components/ui/ui-patterns'

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
    <div ref={containerRef} className={SEGMENTED_CONTAINER_CLASS}>
      <motion.div
        className={SEGMENTED_INDICATOR_CLASS}
        initial={false}
        animate={{ left: indicator.left, width: indicator.width }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      <button
        ref={el => {
          buttonRefs.current[0] = el
        }}
        type="button"
        onClick={setRu}
        className={cn(
          SEGMENTED_TRIGGER_CLASS,
          currentLocale === 'ru' ? SEGMENTED_TRIGGER_ACTIVE_CLASS : SEGMENTED_TRIGGER_INACTIVE_CLASS
        )}
        aria-pressed={currentLocale === 'ru'}
        aria-label={t('localeRu')}
      >
        {t('localeRu')}
      </button>

      <button
        ref={el => {
          buttonRefs.current[1] = el
        }}
        type="button"
        onClick={setEn}
        className={cn(
          SEGMENTED_TRIGGER_CLASS,
          currentLocale === 'en' ? SEGMENTED_TRIGGER_ACTIVE_CLASS : SEGMENTED_TRIGGER_INACTIVE_CLASS
        )}
        aria-pressed={currentLocale === 'en'}
        aria-label={t('localeEn')}
      >
        {t('localeEn')}
      </button>
    </div>
  )
}
