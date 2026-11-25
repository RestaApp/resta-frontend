import { useState } from 'react'
import type { ReactNode } from 'react'
import { motion, useTransform } from 'motion/react'
import { Loader } from '@/components/ui/loader'
import { cn } from '@/shared/utils/cn'
import {
  MAX_OVERSCROLL_DISTANCE,
  useOverscrollBounce,
} from '@/shared/lib/hooks/useOverscrollBounce'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<unknown> | void
  staticContent?: ReactNode
  className?: string
  /** Обновление недоступно (идёт загрузка): резинка работает, спиннера и запроса нет. */
  disabled?: boolean
  threshold?: number
}

/** Высота слота спиннера, который выезжает из-под верхней границы списка. */
const INDICATOR_HEIGHT = 32

/**
 * Список с резинкой на обоих краях (`useOverscrollBounce`) и обновлением по тяге
 * вниз: отпустили за порогом — список держится на пороге со спиннером, пока идёт
 * `onRefresh`. `staticContent` (шапка, фильтры) остаётся на месте.
 */
export function PullToRefresh({
  children,
  onRefresh,
  staticContent,
  className,
  disabled = false,
  threshold = 72,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const { containerRef, offset, direction } = useOverscrollBounce({
    disabled: isRefreshing,
    restOffset: isRefreshing ? threshold : 0,
    onRelease: released => {
      if (!disabled && released >= threshold) void refresh()
    },
  })

  const indicatorY = useTransform(offset, value => value - INDICATOR_HEIGHT)
  const indicatorOpacity = useTransform(offset, [0, threshold], [0, 1])
  const showIndicator = direction > 0 && (isRefreshing || !disabled)

  return (
    <div ref={containerRef} className={cn('relative overscroll-y-contain', className)}>
      {staticContent}

      <div className="relative">
        {showIndicator ? (
          // Окно фиксированной высоты обрезает спиннер по верхней границе списка;
          // сам спиннер двигается только через transform/opacity — без layout.
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden"
            style={{ height: MAX_OVERSCROLL_DISTANCE }}
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
        {/* Слой промотируется только на время сдвига: постоянный will-change держал бы
            в памяти слой высотой во всю ленту. */}
        <motion.div style={{ y: offset, willChange: direction === 0 ? undefined : 'transform' }}>
          {children}
        </motion.div>
      </div>
    </div>
  )
}
