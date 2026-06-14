import { useCallback, useRef, useState } from 'react'
import type { TouchEvent, ReactNode } from 'react'
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

const MAX_PULL_DISTANCE = 120
const RESISTANCE = 0.45

export function PullToRefresh({
  children,
  onRefresh,
  staticContent,
  className,
  disabled = false,
  threshold = 72,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)

  const isTouchInsideContainer = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const target = event.target
    if (!(target instanceof Node)) return false
    return containerRef.current?.contains(target) ?? false
  }, [])

  const canStartPull = useCallback(() => {
    return !disabled && !isRefreshing && !isBodyScrollLocked() && getAppScrollTop() <= 0
  }, [disabled, isRefreshing])

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (!isTouchInsideContainer(event)) return
      if (!canStartPull()) return
      if (event.touches.length !== 1) return

      startYRef.current = event.touches[0].clientY
      isDraggingRef.current = true
      setIsDragging(true)
    },
    [canStartPull, isTouchInsideContainer]
  )

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      if (!isTouchInsideContainer(event)) {
        startYRef.current = null
        isDraggingRef.current = false
        setIsDragging(false)
        setPullDistance(0)
        return
      }
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
    [isTouchInsideContainer]
  )

  const finishPull = useCallback(async () => {
    const shouldRefresh = pullDistance >= threshold

    startYRef.current = null
    isDraggingRef.current = false
    setIsDragging(false)

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
    setIsDragging(false)
    setPullDistance(0)
  }, [])

  const isReady = pullDistance >= threshold
  const indicatorHeight = isRefreshing ? threshold : pullDistance
  const contentOffset = isRefreshing ? threshold : pullDistance

  return (
    <div
      ref={containerRef}
      className={cn('relative overscroll-y-contain', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {staticContent}

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-end justify-center overflow-hidden transition-[height,opacity] duration-200"
          style={{
            height: indicatorHeight,
            opacity: indicatorHeight > 0 ? 1 : 0,
          }}
          aria-hidden="true"
        >
          <div className="pb-2">
            <Loader size="sm" className={cn(!isRefreshing && !isReady && 'opacity-50')} />
          </div>
        </div>
        <div
          className={cn(
            'will-change-transform',
            !isDragging && 'transition-transform duration-200 ease-out'
          )}
          style={{
            transform: contentOffset > 0 ? `translate3d(0, ${contentOffset}px, 0)` : undefined,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
