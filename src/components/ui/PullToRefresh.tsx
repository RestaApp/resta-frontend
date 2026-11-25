import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode, TouchEvent as ReactTouchEvent } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/shared/utils/cn'
import { getAppScrollTop } from '@/shared/ui/appScroll'
import { isBodyScrollLocked } from '@/shared/lib/hooks/useBodyScrollLock'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<unknown> | void
  staticContent?: ReactNode
  className?: string
  disabled?: boolean
  threshold?: number
}

/** Предел сдвига списка: к нему кривая сопротивления стремится, но не достигает. */
const MAX_PULL_DISTANCE = 140
/** Мёртвая зона: до неё жест не считается тягой (тап, дрожание пальца, выбор оси). */
const ACTIVATION_SLOP = 8
/** Высота слота спиннера, который выезжает из-под верхней границы списка. */
const INDICATOR_HEIGHT = 32
const SETTLE_TRANSITION = { duration: 0.2, ease: 'easeOut' } as const

/**
 * «Резинка»: у начала список идёт за пальцем 1:1, дальше плавно замедляется
 * и асимптотически упирается в MAX_PULL_DISTANCE — без жёсткой остановки.
 */
const applyResistance = (delta: number): number =>
  (delta * MAX_PULL_DISTANCE) / (MAX_PULL_DISTANCE + delta)

interface PullGesture {
  anchorX: number
  anchorY: number
  /** Жест распознан как тяга вниз от верхней границы. */
  engaged: boolean
}

export function PullToRefresh({
  children,
  onRefresh,
  staticContent,
  className,
  disabled = false,
  threshold = 72,
}: PullToRefreshProps) {
  const reduceMotion = useReducedMotion()
  const [isRefreshing, setIsRefreshing] = useState(false)
  // Жест или возврат списка ещё идут: спиннер смонтирован, слой списка промотирован.
  const [isActive, setIsActive] = useState(false)

  // Сдвиг списка — motion value: меняется на каждом touchmove мимо рендера React.
  const pull = useMotionValue(0)
  const indicatorY = useTransform(pull, value => value - INDICATOR_HEIGHT)
  const indicatorOpacity = useTransform(pull, [0, threshold], [0, 1])

  const containerRef = useRef<HTMLDivElement>(null)
  const gestureRef = useRef<PullGesture | null>(null)
  const stopSettleRef = useRef<(() => void) | null>(null)

  const settle = useCallback(
    (target: number, onSettled?: () => void) => {
      stopSettleRef.current?.()
      const controls = animate(pull, target, {
        ...(reduceMotion ? { duration: 0 } : SETTLE_TRANSITION),
        onComplete: onSettled,
      })
      stopSettleRef.current = () => controls.stop()
    },
    [pull, reduceMotion]
  )

  const release = useCallback(() => {
    settle(0, () => setIsActive(false))
  }, [settle])

  useEffect(() => () => stopSettleRef.current?.(), [])

  // touchmove — нативным non-passive слушателем: React вешает touchmove как passive,
  // и `preventDefault` в React-обработчике не работает. Без него iOS на верхней
  // границе включает нативный overscroll и сдвигает весь scroll-root вместе с шапкой,
  // а не только список.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchMove = (event: TouchEvent) => {
      const gesture = gestureRef.current
      const touch = event.touches[0]
      if (!gesture || !touch) return

      if (!gesture.engaged) {
        const deltaX = touch.clientX - gesture.anchorX
        const deltaY = touch.clientY - gesture.anchorY

        // Пока список не на верхней границе или палец идёт вверх — это обычный скролл.
        // Якорь едет за пальцем, чтобы тяга подхватилась тем же касанием, как только
        // скролл дойдёт до верха, без повторного касания.
        if (getAppScrollTop() > 0 || deltaY < 0) {
          gesture.anchorX = touch.clientX
          gesture.anchorY = touch.clientY
          return
        }

        if (Math.max(Math.abs(deltaX), deltaY) < ACTIVATION_SLOP) return

        // Горизонтальный жест (лента чипов фильтров) — не наш.
        if (Math.abs(deltaX) > deltaY) {
          gestureRef.current = null
          return
        }

        gesture.engaged = true
        // Отсчёт от границы мёртвой зоны: список трогается с нуля, без скачка.
        gesture.anchorY += ACTIVATION_SLOP
        stopSettleRef.current?.()
        setIsActive(true)
      }

      const delta = touch.clientY - gesture.anchorY
      if (delta <= 0) {
        pull.set(0)
        return
      }

      if (event.cancelable) event.preventDefault()
      pull.set(applyResistance(delta))
    }

    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => container.removeEventListener('touchmove', handleTouchMove)
  }, [pull])

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    if (disabled || isRefreshing || isBodyScrollLocked() || event.touches.length !== 1 || !touch) {
      gestureRef.current = null
      return
    }

    gestureRef.current = { anchorX: touch.clientX, anchorY: touch.clientY, engaged: false }
  }

  const refresh = async () => {
    setIsRefreshing(true)
    settle(threshold)

    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
      release()
    }
  }

  const handleTouchEnd = () => {
    const gesture = gestureRef.current
    gestureRef.current = null
    if (!gesture?.engaged) return

    if (pull.get() >= threshold) {
      void refresh()
      return
    }
    release()
  }

  const handleTouchCancel = () => {
    const gesture = gestureRef.current
    gestureRef.current = null
    if (gesture?.engaged) release()
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overscroll-y-contain', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {staticContent}

      <div className="relative">
        {isActive ? (
          // Окно фиксированной высоты обрезает спиннер по верхней границе списка;
          // сам спиннер двигается только через transform/opacity — без layout.
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden"
            style={{ height: MAX_PULL_DISTANCE }}
            aria-hidden="true"
          >
            <motion.div
              className="flex items-end justify-center pb-2"
              style={{ height: INDICATOR_HEIGHT, y: indicatorY, opacity: indicatorOpacity }}
            >
              <Loader size="sm" />
            </motion.div>
          </div>
        ) : null}
        <motion.div style={{ y: pull, willChange: isActive ? 'transform' : undefined }}>
          {children}
        </motion.div>
      </div>
    </div>
  )
}
