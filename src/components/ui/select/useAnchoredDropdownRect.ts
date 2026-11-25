import { useLayoutEffect, useState, type RefObject } from 'react'

const DROPDOWN_GAP_PX = 4
const DROPDOWN_MAX_HEIGHT = 215
const VIEWPORT_PADDING = 16
const DROPDOWN_MIN_HEIGHT = 80
/** Зазор между якорем и краем видимой части формы после подтягивания. */
const REVEAL_MARGIN = 8

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
 * Подтягивает якорь в видимую часть его scroll-контейнера (DrawerBody).
 * Нужно, когда клавиатура сжала форму и поле осталось ниже видимой области:
 * скролл формы на время открытого списка заблокирован, сам он туда не доедет,
 * а список рисовался бы у невидимого поля — поверх футера и под клавиатурой.
 */
const revealAnchor = (anchor: HTMLElement, container: HTMLElement) => {
  const anchorRect = anchor.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const viewport = getVisibleViewport()
  const visibleTop = Math.max(containerRect.top, viewport.top) + REVEAL_MARGIN
  const visibleBottom = Math.min(containerRect.bottom, viewport.bottom) - REVEAL_MARGIN

  if (anchorRect.bottom > visibleBottom) {
    container.scrollTop += anchorRect.bottom - visibleBottom
  } else if (anchorRect.top < visibleTop) {
    container.scrollTop -= visibleTop - anchorRect.top
  }
}

/**
 * Синхронизирует fixed-позицию дропдауна с якорным элементом (scroll/resize).
 * Если под якорем список не помещается, а над ним места больше — открывает вверх.
 * При открытии и при изменении экрана (клавиатура) подтягивает якорь в видимую зону.
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

    const scrollContainer = anchor.closest<HTMLElement>('[data-scroll-container="true"]')
    const revealAndUpdate = () => {
      if (scrollContainer) revealAnchor(anchor, scrollContainer)
      update()
    }

    revealAndUpdate()

    const visualViewport = window.visualViewport
    window.addEventListener('resize', revealAndUpdate)
    window.addEventListener('scroll', update, true)
    visualViewport?.addEventListener('resize', revealAndUpdate)
    visualViewport?.addEventListener('scroll', update)

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(anchor)
    // Форма меняет высоту на кадр позже события окна (шторка подстраивается под
    // клавиатуру) — подтягиваем якорь по фактическому размеру формы.
    const containerRo =
      scrollContainer && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(revealAndUpdate)
        : null
    if (scrollContainer) containerRo?.observe(scrollContainer)

    return () => {
      window.removeEventListener('resize', revealAndUpdate)
      window.removeEventListener('scroll', update, true)
      visualViewport?.removeEventListener('resize', revealAndUpdate)
      visualViewport?.removeEventListener('scroll', update)
      ro?.disconnect()
      containerRo?.disconnect()
    }
  }, [isOpen, anchorRef])

  return isOpen ? rect : null
}
