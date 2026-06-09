import { useLayoutEffect } from 'react'
import { getAppScrollRoot } from '@/shared/ui/appScroll'

let lockCount = 0
const KEY = 'data-prev-scroll-lock'

/** Активен ли хотя бы один overlay с блокировкой скролла (drawer, modal, …). */
export function isBodyScrollLocked(): boolean {
  return lockCount > 0
}

interface ScrollLockSnapshot {
  body?: {
    overflow?: string
    position?: string
    top?: string
    left?: string
    right?: string
    width?: string
  }
  html?: {
    overflow?: string
  }
  appScrollRoot?: {
    overflow?: string
    overscrollBehaviorY?: string
    pointerEvents?: string
    touchAction?: string
  }
  scrollY?: number
}

export function useBodyScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return
    if (typeof document === 'undefined') return

    const body = document.body
    const html = document.documentElement
    const appScrollRoot = getAppScrollRoot()
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
          appScrollRoot: appScrollRoot
            ? {
                overflow: appScrollRoot.style.overflow,
                overscrollBehaviorY: appScrollRoot.style.overscrollBehaviorY,
                pointerEvents: appScrollRoot.style.pointerEvents,
                touchAction: appScrollRoot.style.touchAction,
              }
            : undefined,
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

      if (appScrollRoot) {
        appScrollRoot.style.overflow = 'hidden'
        appScrollRoot.style.overscrollBehaviorY = 'none'
        appScrollRoot.style.pointerEvents = 'none'
        appScrollRoot.style.touchAction = 'none'
      }
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        const raw = body.getAttribute(KEY)
        try {
          const parsed: ScrollLockSnapshot | null = raw
            ? (JSON.parse(raw) as ScrollLockSnapshot)
            : null
          const prevBody = parsed?.body
          const prevHtml = parsed?.html
          const prevAppScrollRoot = parsed?.appScrollRoot
          const scrollY = typeof parsed?.scrollY === 'number' ? parsed.scrollY : 0
          const appScrollRoot = getAppScrollRoot()

          body.style.overflow = prevBody?.overflow ?? ''
          body.style.position = prevBody?.position ?? ''
          body.style.top = prevBody?.top ?? ''
          body.style.left = prevBody?.left ?? ''
          body.style.right = prevBody?.right ?? ''
          body.style.width = prevBody?.width ?? ''
          html.style.overflow = prevHtml?.overflow ?? ''

          if (appScrollRoot && prevAppScrollRoot) {
            appScrollRoot.style.overflow = prevAppScrollRoot.overflow ?? ''
            appScrollRoot.style.overscrollBehaviorY = prevAppScrollRoot.overscrollBehaviorY ?? ''
            appScrollRoot.style.pointerEvents = prevAppScrollRoot.pointerEvents ?? ''
            appScrollRoot.style.touchAction = prevAppScrollRoot.touchAction ?? ''
          }

          if (typeof window !== 'undefined') window.scrollTo(0, scrollY)
        } catch {
          const appScrollRoot = getAppScrollRoot()
          body.style.overflow = ''
          body.style.position = ''
          body.style.top = ''
          body.style.left = ''
          body.style.right = ''
          body.style.width = ''
          html.style.overflow = ''
          if (appScrollRoot) {
            appScrollRoot.style.overflow = ''
            appScrollRoot.style.overscrollBehaviorY = ''
            appScrollRoot.style.pointerEvents = ''
            appScrollRoot.style.touchAction = ''
          }
        } finally {
          body.removeAttribute(KEY)
        }
      }
    }
  }, [locked])
}
