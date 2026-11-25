import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Loader } from '@/components/ui/loader'
import { PullToRefreshContext } from '@/components/ui/pullToRefreshContext'
import type {
  PullToRefreshRegistration,
  RegisterPullToRefresh,
} from '@/components/ui/pullToRefreshContext'
import { isIosDevice } from '@/app/contexts/telegram/utils'
import { getAppScrollRoot } from '@/shared/ui/appScroll'
import { isBodyScrollLocked } from '@/shared/lib/hooks/useBodyScrollLock'
import { useOverscrollBounce } from '@/shared/lib/hooks/useOverscrollBounce'

interface PageOverscrollProps {
  children: ReactNode
}

/** На сколько нужно оттянуть страницу вниз, чтобы отпускание запустило обновление. */
const REFRESH_THRESHOLD = 72

/**
 * Оболочка прокручиваемой страницы: резинка на краях скролла и обновление по
 * тяге вниз. Двигается вся страница вместе с шапкой, как в нативных списках.
 *
 * Резинка:
 *  - iOS — нативная, её даёт система (scroll-root не запрещает overscroll);
 *  - остальные платформы — имитация `useOverscrollBounce`.
 *
 * Обновление общее для обоих вариантов. Экран объявляет его через `PullToRefresh`;
 * срабатывает оно, только если палец коснулся экрана, когда страница уже была в
 * самом верху, — отскок и «долистал и тянет дальше» обновление не запускают.
 * Пока идёт запрос, страница удерживается приоткрытой со спиннером над шапкой.
 *
 * Внутри не должно быть `position: fixed`: на время сдвига у слоя есть transform.
 */
export const PageOverscroll = ({ children }: PageOverscrollProps) => {
  const hasNativeBounce = isIosDevice()
  const [isRefreshing, setIsRefreshing] = useState(false)
  // Идёт касание, начатое в самом верху экрана с доступным обновлением.
  const [isArmed, setIsArmed] = useState(false)
  const registrationRef = useRef<PullToRefreshRegistration | null>(null)

  const register = useCallback<RegisterPullToRefresh>(registration => {
    registrationRef.current = registration
    return () => {
      if (registrationRef.current === registration) registrationRef.current = null
    }
  }, [])

  const { containerRef, offset, isShifted } = useOverscrollBounce({
    disabled: hasNativeBounce || isRefreshing,
    restOffset: isRefreshing ? REFRESH_THRESHOLD : 0,
  })

  useEffect(() => {
    const root = getAppScrollRoot()
    if (!root || isRefreshing) return

    let isArmedTouch = false

    const getAvailableRefresh = () => {
      const registration = registrationRef.current
      return registration && !registration.disabled ? registration.onRefresh : null
    }

    const refresh = async (onRefresh: PullToRefreshRegistration['onRefresh']) => {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    const handleTouchStart = (event: TouchEvent) => {
      isArmedTouch =
        event.touches.length === 1 &&
        root.scrollTop <= 0 &&
        !isBodyScrollLocked() &&
        getAvailableRefresh() !== null
      setIsArmed(isArmedTouch)
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (!isArmedTouch || event.touches.length > 0) return
      isArmedTouch = false
      setIsArmed(false)

      // Нативная резинка уводит scrollTop в минус; имитация двигает слой сама.
      const pulled = hasNativeBounce ? -root.scrollTop : offset.get()
      const onRefresh = getAvailableRefresh()
      if (onRefresh && pulled >= REFRESH_THRESHOLD) void refresh(onRefresh)
    }

    root.addEventListener('touchstart', handleTouchStart, { passive: true })
    root.addEventListener('touchend', handleTouchEnd)
    root.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      root.removeEventListener('touchstart', handleTouchStart)
      root.removeEventListener('touchend', handleTouchEnd)
      root.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [hasNativeBounce, isRefreshing, offset])

  return (
    <PullToRefreshContext.Provider value={register}>
      {/* Слой промотируется только на время сдвига: постоянный will-change держал бы
          в памяти слой высотой во всю страницу. */}
      <motion.div
        ref={containerRef}
        className="relative"
        style={{ y: offset, willChange: isShifted ? 'transform' : undefined }}
      >
        {isArmed || isRefreshing ? (
          // Спиннер стоит сразу над страницей — в зазоре, который открывает тяга.
          <div
            className="pointer-events-none absolute inset-x-0 bottom-full flex justify-center pb-2"
            aria-hidden="true"
          >
            <Loader size="sm" />
          </div>
        ) : null}
        {children}
      </motion.div>
    </PullToRefreshContext.Provider>
  )
}
