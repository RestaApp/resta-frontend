import { useEffect, type RefObject } from 'react'

/** Прокручивает контейнер drawer к ref, когда условие выполнено. */
export const useScrollToRefWhen = (
  enabled: boolean,
  ref: RefObject<HTMLElement | null>,
  block: ScrollLogicalPosition = 'start'
) => {
  useEffect(() => {
    if (!enabled) return

    const frame = requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ block, behavior: 'smooth' })
    })

    return () => cancelAnimationFrame(frame)
  }, [block, enabled, ref])
}
