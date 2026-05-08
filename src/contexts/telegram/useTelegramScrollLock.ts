import { useEffect } from 'react'

/**
 * Блокирует скролл `html`/`body` и `overscroll-behavior-y` при включённом
 * fullscreen — иначе Telegram WebView пускает rubber‑band scroll над контентом.
 *
 * Side effect: чисто DOM‑style writes; всегда восстанавливает предыдущие значения.
 */
export const useTelegramScrollLock = (locked: boolean): void => {
  useEffect(() => {
    if (typeof document === 'undefined') return

    const html = document.documentElement
    const body = document.body

    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevHtmlOverscroll = html.style.overscrollBehaviorY
    const prevBodyOverscroll = body.style.overscrollBehaviorY

    if (locked) {
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
      html.style.overscrollBehaviorY = 'none'
      body.style.overscrollBehaviorY = 'none'
    } else {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      html.style.overscrollBehaviorY = prevHtmlOverscroll
      body.style.overscrollBehaviorY = prevBodyOverscroll
    }

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      html.style.overscrollBehaviorY = prevHtmlOverscroll
      body.style.overscrollBehaviorY = prevBodyOverscroll
    }
  }, [locked])
}
