import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Loader } from '@/components/ui/loader'

type Props = {
  children: React.ReactNode
  onRefresh: () => void | Promise<void>
  isRefreshing: boolean
  enabled?: boolean
  className?: string
}

const MAX_PULL_PX = 120
const TRIGGER_PX = 72

export function PullToRefresh({ children, onRefresh, isRefreshing, enabled = true, className }: Props) {
  const { t } = useTranslation()
  const startYRef = useRef<number | null>(null)
  const pullingRef = useRef(false)
  const [pullPx, setPullPx] = useState(0)
  const [armed, setArmed] = useState(false)
  const [didTrigger, setDidTrigger] = useState(false)

  const reset = useCallback(() => {
    startYRef.current = null
    pullingRef.current = false
    setPullPx(0)
    setArmed(false)
  }, [])

  const canStartPull = useCallback(() => {
    if (!enabled) return false
    if (isRefreshing) return false
    if (typeof window === 'undefined') return false
    if (typeof document === 'undefined') return false
    if (!('ontouchstart' in window)) return false
    const drawerOpenCount = Number.parseInt(document.documentElement?.dataset?.drawerOpenCount ?? '0', 10)
    if (Number.isFinite(drawerOpenCount) && drawerOpenCount > 0) return false
    return window.scrollY <= 0
  }, [enabled, isRefreshing])

  useEffect(() => {
    if (!enabled) return

    const onTouchStart = (e: TouchEvent) => {
      if (!canStartPull()) return
      if (e.touches.length !== 1) return
      startYRef.current = e.touches[0].clientY
      pullingRef.current = true
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current) return
      const startY = startYRef.current
      if (startY == null) return
      const currentY = e.touches[0]?.clientY ?? startY
      const raw = currentY - startY
      if (raw <= 0) return

      const next = Math.min(MAX_PULL_PX, Math.round(raw * 0.6))
      setPullPx(next)
      setArmed(next >= TRIGGER_PX)

      if (window.scrollY <= 0) e.preventDefault()
    }

    const onTouchEnd = async () => {
      const shouldRefresh = pullingRef.current && armed && !isRefreshing
      reset()
      if (!shouldRefresh) return
      setDidTrigger(true)
      await onRefresh()
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [armed, canStartPull, enabled, isRefreshing, onRefresh, reset])

  useEffect(() => {
    if (!didTrigger) return
    if (isRefreshing) return
    setDidTrigger(false)
  }, [didTrigger, isRefreshing])

  const showIndicator = pullPx > 0 || didTrigger
  const progress = Math.min(1, pullPx / TRIGGER_PX)

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center',
          showIndicator ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          transform: `translateY(${didTrigger ? 0 : Math.max(0, pullPx - 56)}px)`,
        }}
      >
        <div className="mt-2 flex items-center gap-2 rounded-full border border-border bg-background/90 backdrop-blur px-3 py-2 shadow-sm">
          {didTrigger ? (
            <Loader size="sm" />
          ) : (
            <ArrowDown
              className="h-4 w-4 text-muted-foreground"
              style={{ transform: `rotate(${Math.round(progress * 180)}deg)` }}
            />
          )}
          {!didTrigger ? (
            <span className="text-xs text-muted-foreground">
              {armed ? t('common.releaseToRefresh') : t('common.pullToRefresh')}
            </span>
          ) : null}
        </div>
      </div>

      {children}
    </div>
  )
}
