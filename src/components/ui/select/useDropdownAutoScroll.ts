import { useCallback, useEffect, useRef, type RefObject } from 'react'

const DESIRED_DROPDOWN_HEIGHT = 215
const SCROLL_PADDING_BUFFER = 24

interface UseDropdownAutoScrollParams {
  isOpen: boolean
  containerRef: RefObject<HTMLElement | null>
  bottomOffsetPx: number
  /** Fixed portal: считаем место от viewport, а не от dialog/scroll-контейнера. */
  portaled?: boolean
  enabled?: boolean
}

const getScrollableAncestor = (element: HTMLElement | null): HTMLElement | null => {
  let current = element?.parentElement ?? null
  while (current) {
    const { overflowY } = window.getComputedStyle(current)
    const canScroll =
      (overflowY === 'auto' || overflowY === 'scroll') &&
      current.scrollHeight > current.clientHeight
    if (canScroll) return current
    current = current.parentElement
  }
  return null
}

/** Прокручивает ближайший scroll-контейнер, если под триггером не хватает места для дропдауна. */
export const useDropdownAutoScroll = ({
  isOpen,
  containerRef,
  bottomOffsetPx,
  portaled = false,
  enabled = true,
}: UseDropdownAutoScrollParams): void => {
  const didAutoScrollRef = useRef(false)
  const addedPaddingRef = useRef<{ container: HTMLElement; original: string } | null>(null)

  useEffect(() => {
    if (!isOpen) {
      didAutoScrollRef.current = false
      if (addedPaddingRef.current) {
        const { container, original } = addedPaddingRef.current
        container.style.paddingBottom = original
        addedPaddingRef.current = null
      }
    }
  }, [isOpen])

  const ensureRoomBelow = useCallback(() => {
    const container = containerRef.current
    if (!container || didAutoScrollRef.current) return

    let rect = container.getBoundingClientRect()
    const scrollContainer =
      (container.closest('[data-scroll-container="true"]') as HTMLElement | null) ??
      getScrollableAncestor(container)
    const scrollContainerRect = scrollContainer?.getBoundingClientRect()
    const dialogEl = container.closest('[role="dialog"]')
    const dialogRect = dialogEl?.getBoundingClientRect()
    const viewportBottom = portaled
      ? window.innerHeight - SCROLL_PADDING_BUFFER
      : (dialogRect?.bottom ?? scrollContainerRect?.bottom ?? window.innerHeight)
    const effectiveBottomOffset =
      portaled || scrollContainerRect || dialogRect ? 0 : bottomOffsetPx

    let spaceBelow = viewportBottom - rect.bottom - effectiveBottomOffset
    const deficit = DESIRED_DROPDOWN_HEIGHT - spaceBelow
    if (deficit <= 0) return

    if (scrollContainer instanceof HTMLElement) {
      const neededScroll = deficit + SCROLL_PADDING_BUFFER
      const remainingScroll =
        scrollContainer.scrollHeight - scrollContainer.clientHeight - scrollContainer.scrollTop

      if (remainingScroll < neededScroll) {
        const extra = neededScroll - remainingScroll
        addedPaddingRef.current = {
          container: scrollContainer,
          original: scrollContainer.style.paddingBottom,
        }
        const currentPad = parseFloat(window.getComputedStyle(scrollContainer).paddingBottom) || 0
        scrollContainer.style.paddingBottom = `${currentPad + extra}px`
      }

      const updatedRemaining =
        scrollContainer.scrollHeight - scrollContainer.clientHeight - scrollContainer.scrollTop
      const scrollDelta = Math.min(neededScroll, Math.max(updatedRemaining, 0))
      if (scrollDelta > 0) {
        didAutoScrollRef.current = true
        scrollContainer.scrollBy({ top: scrollDelta, behavior: 'auto' })
        rect = container.getBoundingClientRect()
        spaceBelow = viewportBottom - rect.bottom - effectiveBottomOffset
      }
    } else {
      const maxWindowScroll = document.documentElement.scrollHeight - window.innerHeight
      const remainingWindowScroll = Math.max(maxWindowScroll - window.scrollY, 0)
      const scrollDelta = Math.min(deficit + SCROLL_PADDING_BUFFER, remainingWindowScroll)
      if (scrollDelta > 0) {
        didAutoScrollRef.current = true
        window.scrollBy({ top: scrollDelta, behavior: 'auto' })
      }
    }
  }, [containerRef, bottomOffsetPx, portaled])

  useEffect(() => {
    if (!enabled || !isOpen || portaled || !containerRef.current) return

    let rafId: number | null = null
    const throttledEnsure = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        ensureRoomBelow()
        rafId = null
      })
    }

    throttledEnsure()
    const delayedId = setTimeout(ensureRoomBelow, 100)
    window.addEventListener('resize', throttledEnsure)
    window.addEventListener('scroll', throttledEnsure, true)

    return () => {
      clearTimeout(delayedId)
      window.removeEventListener('resize', throttledEnsure)
      window.removeEventListener('scroll', throttledEnsure, true)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [enabled, isOpen, containerRef, ensureRoomBelow])
}
