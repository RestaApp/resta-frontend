import { useEffect, type RefObject } from 'react'

type UseFocusTrapOptions = {
  active: boolean
  containerRef: RefObject<HTMLElement | null>
  initialFocusSelector?: string
  onEscape?: () => void
}

const getFocusable = (root: HTMLElement) =>
  Array.from(
    root.querySelectorAll<HTMLElement>(
      'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
    )
  ).filter(
    el =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      el.offsetParent != null
  )

export function useFocusTrap({
  active,
  containerRef,
  initialFocusSelector,
  onEscape,
}: UseFocusTrapOptions) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return

    const prevActive = document.activeElement as HTMLElement | null

    queueMicrotask(() => {
      const root = containerRef.current
      if (!root) return

      const target = initialFocusSelector
        ? (root.querySelector(initialFocusSelector) as HTMLElement | null)
        : null

      if (target) {
        target.focus()
        return
      }

      const focusables = getFocusable(root)
      if (focusables[0]) {
        focusables[0].focus()
        return
      }

      root.focus()
    })

    const onKeyDownInternal = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
        return
      }

      if (e.key !== 'Tab') return

      const root = containerRef.current
      if (!root) return

      const focusables = getFocusable(root)
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return

      const activeElement = document.activeElement
      if (e.shiftKey && activeElement === first) {
        e.preventDefault()
        last.focus()
        return
      }

      if (!e.shiftKey && activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDownInternal)
    return () => {
      window.removeEventListener('keydown', onKeyDownInternal)
      prevActive?.focus?.()
    }
  }, [active, containerRef, initialFocusSelector, onEscape])
}
