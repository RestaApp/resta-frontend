import { useEffect } from 'react'
import { triggerTelegramBack } from '@/shared/utils/telegram'

/** Свайп начинается только у левого края экрана (px). */
const EDGE_START_PX = 24
/** Минимальная горизонтальная дистанция, чтобы засчитать «назад» (px). */
const MIN_DISTANCE_PX = 70
/** Допустимый наклон: вертикальное смещение не больше доли от горизонтального. */
const MAX_OFF_AXIS_RATIO = 0.6

/**
 * Жест «назад» свайпом от левого края (#11). Telegram не даёт нативного
 * горизонтального back-swipe — реализуем сами. Дёргает тот же верхний обработчик
 * стека, что и нативная BackButton (`triggerTelegramBack`), поэтому ведёт себя
 * идентично кнопке и ничего не делает на верхнеуровневых экранах (стек пуст).
 * Вертикальные свайпы Telegram уже отключены — конфликта нет. Listeners passive.
 */
export const SwipeBackGesture = () => {
  useEffect(() => {
    let tracking = false
    let startX = 0
    let startY = 0

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        tracking = false
        return
      }
      const touch = event.touches[0]
      if (!touch) {
        tracking = false
        return
      }
      tracking = touch.clientX <= EDGE_START_PX
      startX = touch.clientX
      startY = touch.clientY
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking) return
      tracking = false
      const touch = event.changedTouches[0]
      if (!touch) return

      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      // Свайп вправо от края, преимущественно горизонтальный.
      if (dx >= MIN_DISTANCE_PX && Math.abs(dy) <= dx * MAX_OFF_AXIS_RATIO) {
        triggerTelegramBack()
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return null
}
