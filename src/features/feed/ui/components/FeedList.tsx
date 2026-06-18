import { useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { FeedCard } from '@/components/ui/shift-card/ShiftCard'
import { InfiniteScrollTrigger } from '@/shared/ui/InfiniteScrollTrigger'
import { getAppScrollRoot } from '@/shared/ui/appScroll'
import type { Shift } from '@/shared/shifts/types'
import type { UseVacanciesInfiniteListReturn } from '@/features/feed/model/hooks/useVacanciesInfiniteList'
import type { ShiftStatus } from '@/shared/shifts/types'

interface FeedListProps {
  shifts: Shift[]
  activeList: UseVacanciesInfiniteListReturn
  getApplicationStatus: (id: number) => ShiftStatus | null
  onOpenDetails: (id: number) => void
}

/** Примерная высота карточки до измерения (px). */
const ESTIMATED_CARD_HEIGHT = 152

export function FeedList({
  shifts,
  activeList,
  getApplicationStatus,
  onOpenDetails,
}: FeedListProps) {
  const sortedShifts = useMemo(() => {
    if (!shifts.length) return shifts

    return shifts
      .map((shift, index) => ({
        shift,
        index,
        isRejected: getApplicationStatus(shift.id) === 'rejected',
      }))
      .sort((a, b) => {
        if (a.isRejected === b.isRejected) {
          return a.index - b.index
        }
        return a.isRejected ? 1 : -1
      })
      .map(item => item.shift)
  }, [shifts, getApplicationStatus])

  const containerRef = useRef<HTMLDivElement>(null)
  // Лента живёт в общем scroll-root приложения, выше неё — sticky-шапка и бар
  // активных фильтров (его высота меняется). scrollMargin = смещение списка от
  // верха прокручиваемого контента; пересчитываем на скролле/resize, поэтому он
  // остаётся корректным даже когда шапка меняет высоту.
  const [scrollMargin, setScrollMargin] = useState(0)

  useEffect(() => {
    const root = getAppScrollRoot()
    const el = containerRef.current
    if (!root || !el) return

    let rafId = 0
    const measure = () => {
      const next =
        el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
      setScrollMargin(prev => (Math.abs(prev - next) > 0.5 ? next : prev))
    }
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(measure)
    }

    measure()
    root.addEventListener('scroll', onScroll, { passive: true })
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(root)
    resizeObserver.observe(el)

    return () => {
      root.removeEventListener('scroll', onScroll)
      resizeObserver.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [])

  const virtualizer = useVirtualizer({
    count: sortedShifts.length,
    getScrollElement: () => getAppScrollRoot(),
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    overscan: 6,
    scrollMargin,
    getItemKey: index => sortedShifts[index]?.id ?? index,
  })

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <>
      <div
        ref={containerRef}
        style={{
          height: sortedShifts.length ? virtualizer.getTotalSize() : 0,
          position: 'relative',
          width: '100%',
        }}
      >
        {virtualItems.map(item => {
          const shift = sortedShifts[item.index]
          if (!shift) return null
          return (
            <div
              key={item.key}
              data-index={item.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full pb-3"
              style={{ transform: `translateY(${item.start - scrollMargin}px)` }}
            >
              <FeedCard shift={shift} onOpenDetails={onOpenDetails} />
            </div>
          )
        })}
      </div>

      {shifts.length > 0 ? (
        <InfiniteScrollTrigger
          onLoadMore={activeList.loadMore}
          hasMore={activeList.hasMore}
          isLoading={activeList.isFetching}
          isError={!!activeList.error}
        />
      ) : null}
    </>
  )
}
