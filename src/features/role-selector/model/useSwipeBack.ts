import { useEffect, useRef } from 'react'

const EDGE_START_PX = 48
const MIN_SWIPE_X = 72
const MIN_LONG_SWIPE_X = 120
const MIN_WHEEL_SWIPE_X = 72
const MAX_SWIPE_Y = 56
const HORIZONTAL_DOMINANCE = 1.8
const WHEEL_COOLDOWN_MS = 700

const isInteractiveTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest('button, a, input, textarea, select, [role="button"], [data-swipe-ignore]')
  )
}

interface TouchPoint {
  x: number
  y: number
  fromEdge: boolean
  interactive: boolean
}

interface UseSwipeBackOptions {
  enabled: boolean
  onBack: () => void
}

export const useSwipeBack = ({ enabled, onBack }: UseSwipeBackOptions) => {
  const onBackRef = useRef(onBack)
  const startRef = useRef<TouchPoint | null>(null)
  const lastWheelBackAtRef = useRef(0)

  useEffect(() => {
    onBackRef.current = onBack
  }, [onBack])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      startRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        fromEdge: touch.clientX <= EDGE_START_PX,
        interactive: isInteractiveTarget(event.target),
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      const start = startRef.current
      startRef.current = null
      const touch = event.changedTouches[0]
      if (!start || !touch) return

      const deltaX = touch.clientX - start.x
      const deltaY = touch.clientY - start.y
      const absY = Math.abs(deltaY)
      const isRightSwipe = deltaX > MIN_SWIPE_X
      const isMostlyHorizontal = absY < MAX_SWIPE_Y && deltaX > absY * HORIZONTAL_DOMINANCE
      const allowedOrigin = start.fromEdge || (!start.interactive && deltaX > MIN_LONG_SWIPE_X)

      if (isRightSwipe && isMostlyHorizontal && allowedOrigin) {
        onBackRef.current()
      }
    }

    const handleWheel = (event: WheelEvent) => {
      const now = Date.now()
      if (now - lastWheelBackAtRef.current < WHEEL_COOLDOWN_MS) return

      const deltaX = -event.deltaX
      const absY = Math.abs(event.deltaY)
      const isRightSwipe = deltaX > MIN_WHEEL_SWIPE_X
      const isMostlyHorizontal = deltaX > absY * HORIZONTAL_DOMINANCE
      if (!isRightSwipe || !isMostlyHorizontal) return

      lastWheelBackAtRef.current = now
      onBackRef.current()
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [enabled])
}
