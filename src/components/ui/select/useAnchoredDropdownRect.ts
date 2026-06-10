import { useLayoutEffect, useState, type RefObject } from 'react'

const DROPDOWN_GAP_PX = 4

export interface AnchoredDropdownRect {
  top: number
  left: number
  width: number
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
      setRect({
        top: r.bottom + DROPDOWN_GAP_PX,
        left: r.left,
        width: r.width,
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
