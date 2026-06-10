import { useLayoutEffect, type RefObject } from 'react'

type ScrollContainerSnapshot = {
  overflow: string
  overscrollBehaviorY: string
  touchAction: string
}

const lockCounts = new Map<HTMLElement, number>()
const snapshots = new WeakMap<HTMLElement, ScrollContainerSnapshot>()

const lockScrollContainer = (element: HTMLElement): void => {
  const count = lockCounts.get(element) ?? 0
  if (count === 0) {
    snapshots.set(element, {
      overflow: element.style.overflow,
      overscrollBehaviorY: element.style.overscrollBehaviorY,
      touchAction: element.style.touchAction,
    })
    element.style.overflow = 'hidden'
    element.style.overscrollBehaviorY = 'none'
    element.style.touchAction = 'none'
  }
  lockCounts.set(element, count + 1)
}

const unlockScrollContainer = (element: HTMLElement): void => {
  const count = lockCounts.get(element) ?? 0
  if (count <= 1) {
    lockCounts.delete(element)
    const previous = snapshots.get(element)
    if (previous) {
      element.style.overflow = previous.overflow
      element.style.overscrollBehaviorY = previous.overscrollBehaviorY
      element.style.touchAction = previous.touchAction
      snapshots.delete(element)
    }
  } else {
    lockCounts.set(element, count - 1)
  }
}

/** Блокирует пользовательский скролл ближайшего `[data-scroll-container]` (например DrawerBody). */
export const useScrollContainerLock = (
  locked: boolean,
  anchorRef: RefObject<HTMLElement | null>
): void => {
  useLayoutEffect(() => {
    if (!locked) return

    const anchor = anchorRef.current
    if (!anchor) return

    const scrollContainer = anchor.closest('[data-scroll-container="true"]')
    if (!(scrollContainer instanceof HTMLElement)) return

    lockScrollContainer(scrollContainer)
    return () => unlockScrollContainer(scrollContainer)
  }, [locked, anchorRef])
}
