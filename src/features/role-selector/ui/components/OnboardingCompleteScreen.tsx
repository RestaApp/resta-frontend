/**
 * Экран завершения онбординга: «Готово 🎉» + подсказка
 */

import { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

interface OnboardingCompleteScreenProps {
  onComplete: () => void
  /** Задержка перед вызовом onComplete (мс) */
  delayMs?: number
}

export const OnboardingCompleteScreen = memo(function OnboardingCompleteScreen({
  onComplete,
  delayMs = 2500,
}: OnboardingCompleteScreenProps) {
  const { t } = useTranslation()

  useEffect(() => {
    const id = window.setTimeout(onComplete, delayMs)
    return () => clearTimeout(id)
  }, [onComplete, delayMs])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6 text-center"
    >
      <span className="text-5xl mb-4" role="img" aria-hidden>
        {t('onboarding.doneEmoji')}
      </span>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        {t('onboarding.doneTitle')}
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        {t('onboarding.doneTip')}
      </p>
    </motion.div>
  )
})
