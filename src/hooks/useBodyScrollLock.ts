import { useEffect } from 'react'

let lockCount = 0
const KEY = 'data-prev-scroll-lock'

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    if (typeof document === 'undefined') return

    const body = document.body
    const html = document.documentElement
    lockCount += 1
    if (lockCount === 1) {
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0
      body.setAttribute(
        KEY,
        JSON.stringify({
          body: {
            overflow: body.style.overflow,
            position: body.style.position,
            top: body.style.top,
            left: body.style.left,
            right: body.style.right,
            width: body.style.width,
          },
          html: { overflow: html.style.overflow },
          scrollY,
        })
      )

      body.style.overflow = 'hidden'
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'
      html.style.overflow = 'hidden'
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        const raw = body.getAttribute(KEY)
        try {
          const parsed = raw ? (JSON.parse(raw) as any) : null
          const prevBody = parsed?.body
          const prevHtml = parsed?.html
          const scrollY = typeof parsed?.scrollY === 'number' ? parsed.scrollY : 0

          body.style.overflow = prevBody?.overflow ?? ''
          body.style.position = prevBody?.position ?? ''
          body.style.top = prevBody?.top ?? ''
          body.style.left = prevBody?.left ?? ''
          body.style.right = prevBody?.right ?? ''
          body.style.width = prevBody?.width ?? ''
          html.style.overflow = prevHtml?.overflow ?? ''

          if (typeof window !== 'undefined') window.scrollTo(0, scrollY)
        } catch {
          body.style.overflow = ''
          body.style.position = ''
          body.style.top = ''
          body.style.left = ''
          body.style.right = ''
          body.style.width = ''
          html.style.overflow = ''
        } finally {
          body.removeAttribute(KEY)
        }
      }
    }
  }, [locked])
}
