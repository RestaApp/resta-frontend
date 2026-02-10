import { useEffect } from 'react'

let lockCount = 0
const KEY = 'data-prev-overflow'

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    if (typeof document === 'undefined') return

    const body = document.body
    lockCount += 1
    if (lockCount === 1) {
      body.setAttribute(KEY, body.style.overflow)
      body.style.overflow = 'hidden'
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        body.style.overflow = body.getAttribute(KEY) ?? ''
        body.removeAttribute(KEY)
      }
    }
  }, [locked])
}
