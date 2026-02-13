import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface AddShiftOnboardingOverlayProps {
  visible: boolean
  targetRef: React.RefObject<HTMLElement | null>
  onClose: () => void
  onProxyClick: () => void
}

export const AddShiftOnboardingOverlay = memo(function AddShiftOnboardingOverlay({
  visible,
  targetRef,
  onClose,
  onProxyClick,
}: AddShiftOnboardingOverlayProps) {
  const { t } = useTranslation()
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
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        className="absolute rounded-full"
        style={{
          left: circleLeft,
          top: circleTop,
          width: circleSize,
          height: circleSize,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
          pointerEvents: 'none',
        }}
      />

      <button
        type="button"
        onClick={onProxyClick}
        aria-label={t('shift.addShiftAria')}
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
        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground">
            {t('activity.addShiftOnboardingText')}
          </p>
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t('common.understand')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})
