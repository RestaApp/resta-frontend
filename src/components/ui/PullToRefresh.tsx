import { useCallback, useMemo, useRef, useState } from 'react'
import type { TouchEvent, ReactNode } from 'react'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/utils/cn'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<unknown> | void
  className?: string
  disabled?: boolean
  threshold?: number
}

const MAX_PULL_DISTANCE = 120
const RESISTANCE = 0.45

export function PullToRefresh({
  children,
  onRefresh,
  className,
  disabled = false,
  threshold = 72,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const startYRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)

  const canStartPull = useCallback(() => {
    return !disabled && !isRefreshing && window.scrollY <= 0
  }, [disabled, isRefreshing])

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (!canStartPull()) return
      if (event.touches.length !== 1) return

      startYRef.current = event.touches[0].clientY
      isDraggingRef.current = true
    },
    [canStartPull]
  )

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current || startYRef.current === null) return

      const currentY = event.touches[0]?.clientY
      if (typeof currentY !== 'number') return

      const delta = currentY - startYRef.current
      if (delta <= 0) {
        setPullDistance(0)
        return
      }

      const nextDistance = Math.min(MAX_PULL_DISTANCE, delta * RESISTANCE)
      setPullDistance(nextDistance)
      event.preventDefault()
    },
    []
  )

  const finishPull = useCallback(async () => {
    const shouldRefresh = pullDistance >= threshold

    startYRef.current = null
    isDraggingRef.current = false

    if (!shouldRefresh) {
      setPullDistance(0)
      return
    }

    setIsRefreshing(true)
    setPullDistance(threshold)

    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
      setPullDistance(0)
    }
  }, [onRefresh, pullDistance, threshold])

  const handleTouchEnd = useCallback(() => {
    void finishPull()
  }, [finishPull])

  const handleTouchCancel = useCallback(() => {
    startYRef.current = null
    isDraggingRef.current = false
    setPullDistance(0)
  }, [])

  const isReady = pullDistance >= threshold
  const indicatorHeight = useMemo(
    () => (isRefreshing ? threshold : pullDistance),
    [isRefreshing, pullDistance, threshold]
  )

  return (
    <div
      className={cn('relative', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <div
        className="flex items-end justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: indicatorHeight }}
        aria-hidden="true"
      >
        <div className="pb-2">
          <Loader size="sm" className={cn(!isRefreshing && !isReady && 'opacity-50')} />
        </div>
      </div>
      {children}
    </div>
  )
}
