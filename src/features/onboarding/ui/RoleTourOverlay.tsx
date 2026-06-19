import { createElement, memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MODAL_TITLE_CLASS, BODY_MUTED_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'
import { Z_INDEX } from '@/shared/ui/zIndex'
import type { RoleTourStep } from '../model/roleTourContent'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

interface RoleTourOverlayProps {
  step: RoleTourStep
  stepIndex: number
  total: number
  isLast: boolean
  onNext: () => void
  onSkip: () => void
}

/**
 * Один шаг coach-marks тура: затемнение, подсветка активной вкладки нижней
 * навигации (`[data-nav-tab]`) и карточка-пояснение над ней.
 */
export const RoleTourOverlay = memo(function RoleTourOverlay({
  step,
  stepIndex,
  total,
  isLast,
  onNext,
  onSkip,
}: RoleTourOverlayProps) {
  const { t } = useTranslation()
  const [rect, setRect] = useState<Rect | null>(null)

  useEffect(() => {
    const update = () => {
      const el = document.querySelector(`[data-nav-tab="${step.tabId}"]`)
      if (!(el instanceof HTMLElement)) return
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    // Двойной rAF — дождаться переключения вкладки и перерисовки навигации.
    const raf = requestAnimationFrame(() => requestAnimationFrame(update))
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [step.tabId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip()
      if (e.key === 'Enter') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNext, onSkip])

  if (!rect) return null

  const pad = 6
  const viewportH = typeof window === 'undefined' ? 0 : window.innerHeight
  const viewportW = typeof window === 'undefined' ? 0 : window.innerWidth
  // Положение стрелки внутри карточки (карточка: left-4 right-4 → отступ 16px).
  const tabCenter = rect.left + rect.width / 2
  const arrowLeft = Math.max(12, Math.min(tabCenter - 16 - 6, viewportW - 32 - 18))

  return (
    <div
      className="fixed inset-0"
      role="dialog"
      aria-modal="true"
      aria-label={t(step.titleKey)}
      style={{ zIndex: Z_INDEX.alertDialog }}
    >
      {/* Вырез-spotlight: box-shadow затемняет всё, КРОМЕ активной вкладки
          (она остаётся в полной яркости); border + мягкое свечение — акцент. */}
      <motion.div
        className="absolute rounded-2xl border-2 border-primary"
        initial={false}
        animate={{
          left: rect.left - pad,
          top: rect.top - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          boxShadow: '0 0 0 4px rgba(255,107,44,0.25), 0 0 0 9999px var(--overlay-scrim-strong)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Карточка-пояснение над навигацией */}
      <div className="absolute left-4 right-4" style={{ bottom: viewportH - rect.top + 14 }}>
        <Card className="relative flex flex-col gap-3 p-4 shadow-[var(--shadow-modal)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              {createElement(step.icon, { className: 'h-5 w-5' })}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn(MODAL_TITLE_CLASS, 'text-base')}>{t(step.titleKey)}</p>
              <p className={cn(BODY_MUTED_CLASS, 'mt-0.5')}>{t(step.textKey)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: total }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === stepIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {!isLast ? (
                <Button variant="ghost" size="sm" onClick={onSkip}>
                  {t('onboarding.tour.skip')}
                </Button>
              ) : null}
              <Button variant="gradient" size="sm" onClick={onNext} data-haptic="light">
                {isLast ? t('onboarding.tour.done') : t('onboarding.tour.next')}
              </Button>
            </div>
          </div>

          {/* Стрелка вниз к активной вкладке */}
          <span
            className="absolute h-3 w-3 rotate-45 rounded-sm bg-card"
            style={{ bottom: -6, left: arrowLeft }}
            aria-hidden="true"
          />
        </Card>
      </div>
    </div>
  )
})
