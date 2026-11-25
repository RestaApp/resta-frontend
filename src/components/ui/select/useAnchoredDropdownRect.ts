import { useLayoutEffect, useState, type RefObject } from 'react'

const DROPDOWN_GAP_PX = 4
const DROPDOWN_MAX_HEIGHT = 215
const VIEWPORT_PADDING = 16
const DROPDOWN_MIN_HEIGHT = 80

export interface AnchoredDropdownRect {
  /** `below` — список растёт вниз от `top`; `above` — вверх от `top`. */
  placement: 'below' | 'above'
  top: number
  left: number
  width: number
  maxHeight: number
}

/**
 * Видимая часть окна. Экранная клавиатура не меняет `window.innerHeight`, но
 * сужает `visualViewport` — без него список уходил бы под клавиатуру.
 */
const getVisibleViewport = () => {
  const top = window.visualViewport?.offsetTop ?? 0
  return { top, bottom: top + (window.visualViewport?.height ?? window.innerHeight) }
}

/**
 * Синхронизирует fixed-позицию дропдауна с якорным элементом (scroll/resize).
 * Если под якорем список не помещается, а над ним места больше — открывает вверх.
 */
export const useAnchoredDropdownRect = (
  isOpen: boolean,
  anchorRef: RefObject<HTMLElement | null>
): AnchoredDropdownRect | null => {
  const [rect, setRect] = useState<AnchoredDropdownRect | null>(null)

  useLayoutEffect(() => {
    if (!isOpen) return

    const anchor = anchorRef.current
    if (!anchor) return

    const update = () => {
      const el = anchorRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const viewport = getVisibleViewport()
      const reserved = DROPDOWN_GAP_PX + VIEWPORT_PADDING
      const spaceBelow = viewport.bottom - r.bottom - reserved
      const spaceAbove = r.top - viewport.top - reserved
      const placeAbove = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow
      const space = placeAbove ? spaceAbove : spaceBelow

      setRect({
        placement: placeAbove ? 'above' : 'below',
        top: placeAbove ? r.top - DROPDOWN_GAP_PX : r.bottom + DROPDOWN_GAP_PX,
        left: r.left,
        width: r.width,
        maxHeight: Math.min(DROPDOWN_MAX_HEIGHT, Math.max(space, DROPDOWN_MIN_HEIGHT)),
      })
    }

    update()

    const visualViewport = window.visualViewport
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    visualViewport?.addEventListener('resize', update)
    visualViewport?.addEventListener('scroll', update)

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(anchor)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      visualViewport?.removeEventListener('resize', update)
      visualViewport?.removeEventListener('scroll', update)
      ro?.disconnect()
    }
  }, [isOpen, anchorRef])

  return isOpen ? rect : null
}
