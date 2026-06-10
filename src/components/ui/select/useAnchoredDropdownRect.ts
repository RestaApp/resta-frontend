import { useLayoutEffect, useState, type RefObject } from 'react'

const DROPDOWN_GAP_PX = 4
const DROPDOWN_MAX_HEIGHT = 215
const VIEWPORT_PADDING = 16
const DROPDOWN_MIN_HEIGHT = 80

export interface AnchoredDropdownRect {
  top: number
  left: number
  width: number
  maxHeight: number
}

/** Синхронизирует fixed-позицию дропдауна с якорным элементом (scroll/resize). */
export const useAnchoredDropdownRect = (
  isOpen: boolean,
  anchorRef: RefObject<HTMLElement | null>
): AnchoredDropdownRect | null => {
  const [rect, setRect] = useState<AnchoredDropdownRect | null>(null)

  useLayoutEffect(() => {
    if (!isOpen) {
      setRect(null)
      return
    }

    const anchor = anchorRef.current
    if (!anchor) return

    const update = () => {
      const el = anchorRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - r.bottom - DROPDOWN_GAP_PX - VIEWPORT_PADDING
      const spaceAbove = r.top - DROPDOWN_GAP_PX - VIEWPORT_PADDING
      const openBelow = spaceBelow >= spaceAbove
      const available = openBelow ? spaceBelow : spaceAbove
      const maxHeight = Math.min(
        DROPDOWN_MAX_HEIGHT,
        Math.max(available, DROPDOWN_MIN_HEIGHT)
      )

      const top = openBelow
        ? r.bottom + DROPDOWN_GAP_PX
        : Math.max(VIEWPORT_PADDING, r.top - DROPDOWN_GAP_PX - maxHeight)

      setRect({
        top,
        left: r.left,
        width: r.width,
        maxHeight,
      })
    }

    update()

    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(anchor)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      ro?.disconnect()
    }
  }, [isOpen, anchorRef])

  return rect
}
