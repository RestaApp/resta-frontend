/**
 * Экран завершения онбординга: «Готово 🎉» + подсказка (разные тексты для сотрудника / ресторана / поставщика)
 */

import { memo, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import type { UiRole } from '@/shared/types/roles.types'

interface OnboardingCompleteScreenProps {
  onComplete: () => void
  /** Роль, выбранная при онбординге — от неё зависят заголовок и подсказка */
  role?: UiRole | null
  /** Задержка перед вызовом onComplete (мс) */
  delayMs?: number
}

export const OnboardingCompleteScreen = memo(function OnboardingCompleteScreen({
  onComplete,
  role,
  delayMs = 2500,
}: OnboardingCompleteScreenProps) {
  const { t } = useTranslation()

  const { titleKey, tipKey } = useMemo(() => {
    if (role === 'venue') return { titleKey: 'onboarding.doneTitleVenue', tipKey: 'onboarding.doneTipVenue' }
    if (role === 'supplier') return { titleKey: 'onboarding.doneTitleSupplier', tipKey: 'onboarding.doneTipSupplier' }
    return { titleKey: 'onboarding.doneTitle', tipKey: 'onboarding.doneTip' }
  }, [role])

  useEffect(() => {
    const id = window.setTimeout(onComplete, delayMs)
    return () => clearTimeout(id)
  }, [onComplete, delayMs])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background px-6 text-center"
    >
      <span className="text-5xl mb-4" role="img" aria-hidden>
        {t('onboarding.doneEmoji')}
      </span>
      <h2 className="text-2xl font-semibold text-foreground mb-2">{t(titleKey)}</h2>
      <p className="text-sm text-muted-foreground max-w-xs">{t(tipKey)}</p>
    </motion.div>
  )
})
