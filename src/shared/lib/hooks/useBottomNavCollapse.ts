import { useEffect, useRef } from 'react'
import { useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { getAppScrollRoot } from '@/shared/ui/appScroll'

/** Пикселей скролла вниз до полного сворачивания панели. */
const SCROLL_COLLAPSE_DISTANCE_PX = 72
/** Пикселей скролла вверх до полного разворачивания. */
const SCROLL_EXPAND_DISTANCE_PX = 48

const SPRING_CONFIG = { stiffness: 380, damping: 32, mass: 0.6 }

/**
 * Прогресс сворачивания нижней навигации (0 — развёрнута, 1 — компактная).
 * Привязан к направлению скролла единого scroll-root, как в Instagram.
 */
export const useBottomNavCollapse = () => {
  const reduceMotion = useReducedMotion()
  const progress = useMotionValue(0)
  const animated = useSpring(
    progress,
    reduceMotion ? { stiffness: 1000, damping: 100, mass: 1 } : SPRING_CONFIG
  )
  const lastScrollY = useRef(0)

  useEffect(() => {
    if (reduceMotion) {
      progress.set(0)
      return
    }

    const root = getAppScrollRoot()
    if (!root) return

    let rafId = 0

    const update = () => {
      rafId = 0
      const scrollY = root.scrollTop
      const delta = scrollY - lastScrollY.current
      lastScrollY.current = scrollY

      if (scrollY <= 2) {
        progress.set(0)
        return
      }

      const current = progress.get()
      if (delta > 0) {
        progress.set(Math.min(1, current + delta / SCROLL_COLLAPSE_DISTANCE_PX))
      } else if (delta < 0) {
        progress.set(Math.max(0, current + delta / SCROLL_EXPAND_DISTANCE_PX))
      }
    }

    const onScroll = () => {
      if (rafId === 0) {
        rafId = requestAnimationFrame(update)
      }
    }

    lastScrollY.current = root.scrollTop
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      root.removeEventListener('scroll', onScroll)
      if (rafId !== 0) cancelAnimationFrame(rafId)
    }
  }, [progress, reduceMotion])

  return animated
}
