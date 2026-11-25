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
 * Положение списка относительно якоря. Вверх открываем, если под якорем список
 * не помещается, а над ним места больше. `keepAbove` — список уже открыт вверх:
 * обратно вниз не перекладываем, иначе он скачет, пока экран подстраивается
 * под клавиатуру.
 */
const computeRect = (anchor: HTMLElement, keepAbove: boolean): AnchoredDropdownRect => {
  const r = anchor.getBoundingClientRect()
  const viewport = getVisibleViewport()
  const reserved = DROPDOWN_GAP_PX + VIEWPORT_PADDING
  const spaceBelow = viewport.bottom - r.bottom - reserved
  const spaceAbove = r.top - viewport.top - reserved
  const placeAbove = keepAbove || (spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow)
  const space = placeAbove ? spaceAbove : spaceBelow

  return {
    placement: placeAbove ? 'above' : 'below',
    top: placeAbove ? r.top - DROPDOWN_GAP_PX : r.bottom + DROPDOWN_GAP_PX,
    left: r.left,
    width: r.width,
    maxHeight: Math.min(DROPDOWN_MAX_HEIGHT, Math.max(space, DROPDOWN_MIN_HEIGHT)),
  }
}

const isSameRect = (a: AnchoredDropdownRect, b: AnchoredDropdownRect): boolean =>
  a.placement === b.placement &&
  a.top === b.top &&
  a.left === b.left &&
  a.width === b.width &&
  a.maxHeight === b.maxHeight

/**
 * Держит fixed-позицию дропдауна у якорного элемента, пока список открыт.
 *
 * Сверяется с якорем каждый кадр, а не по событиям scroll/resize: когда экран
 * подстраивается под клавиатуру, поле сдвигается и без них (шторка меняет
 * положение, WebView двигает страницу) — по событиям список оставался бы на
 * старых координатах, оторванным от поля. Заодно подтягивает якорь в видимую
 * часть формы.
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

    const scrollContainer = anchor.closest<HTMLElement>('[data-scroll-container="true"]')
    let frameId = 0
    let current: AnchoredDropdownRect | null = null

    const sync = () => {
      if (scrollContainer) revealAnchor(anchor, scrollContainer)

      const next = computeRect(anchor, current?.placement === 'above')
      if (!current || !isSameRect(current, next)) {
        current = next
        setRect(next)
      }

      frameId = requestAnimationFrame(sync)
    }

    sync()

    return () => cancelAnimationFrame(frameId)
  }, [isOpen, anchorRef])

  return isOpen ? rect : null
}
