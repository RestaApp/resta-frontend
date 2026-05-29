import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BODY_TEXT_CLASS, SHADOW_MODAL_CLASS } from '@/components/ui/ui-patterns'
import { Z_INDEX } from '@/shared/ui/zIndex'

interface AddShiftOnboardingOverlayProps {
  visible: boolean
  targetRef: React.RefObject<HTMLElement | null>
  onClose: () => void
  onProxyClick: () => void
  /** По умолчанию — shift.addShiftAria */
  ariaLabel?: string
  /** По умолчанию — activity.addShiftOnboardingText */
  tooltipText?: string
}

export const AddShiftOnboardingOverlay = memo(function AddShiftOnboardingOverlay({
  visible,
  targetRef,
  onClose,
  onProxyClick,
  ariaLabel,
  tooltipText,
}: AddShiftOnboardingOverlayProps) {
  const { t } = useTranslation()
  const resolvedAria = ariaLabel ?? t('shift.addShiftAria')
  const resolvedTooltip = tooltipText ?? t('activity.addShiftOnboardingText')
  const [rect, setRect] = useState<{
    top: number
    left: number
    right: number
    bottom: number
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    if (!visible) return
    const update = () => {
      const el = targetRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setRect({
        top: r.top,
        left: r.left,
        right: r.right,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      })
    }
    const raf = requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [visible, targetRef])

  if (!visible || !rect) return null

  const circleSize = Math.max(rect.width, rect.height) + 18
  const circleLeft = rect.left + rect.width / 2 - circleSize / 2
  const circleTop = rect.top + rect.height / 2 - circleSize / 2

  const tooltipWidth = 280
  const tooltipLeft =
    typeof window === 'undefined'
      ? 16
      : Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, rect.right - tooltipWidth))

  return (
    <div
      className="fixed inset-0"
      role="dialog"
      aria-modal="true"
      style={{ zIndex: Z_INDEX.alertDialog }}
    >
      <button
        type="button"
        aria-label={t('common.close', { defaultValue: 'Закрыть' })}
        className="absolute inset-0 bg-overlay-scrim cursor-default"
        onClick={onClose}
      />

      <div
        className="absolute rounded-full"
        style={{
          left: circleLeft,
          top: circleTop,
          width: circleSize,
          height: circleSize,
          boxShadow: '0 0 0 9999px var(--overlay-scrim-strong)',
          pointerEvents: 'none',
        }}
      />

      <button
        type="button"
        onClick={onProxyClick}
        aria-label={resolvedAria}
        className="absolute"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          borderRadius: 9999,
          background: 'transparent',
        }}
      />

      <div
        className="absolute"
        style={{
          top: rect.bottom + 12,
          left: tooltipLeft,
          width: tooltipWidth,
        }}
      >
        <Card className={SHADOW_MODAL_CLASS}>
          <p className={BODY_TEXT_CLASS}>{resolvedTooltip}</p>
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t('common.understand')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
})
