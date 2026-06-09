/** Селектор единого scroll-root приложения (`TelegramMiniAppShell`). */
const APP_SCROLL_ROOT_SELECTOR = '[data-app-scroll-root]'

export const getAppScrollRoot = (): HTMLElement | null => {
  if (typeof document === 'undefined') return null
  const el = document.querySelector(APP_SCROLL_ROOT_SELECTOR)
  return el instanceof HTMLElement ? el : null
}

export const getAppScrollTop = (): number => {
  const root = getAppScrollRoot()
  return root ? root.scrollTop : window.scrollY
}

const scrollAppTo = (top: number, behavior: ScrollBehavior = 'auto'): void => {
  const root = getAppScrollRoot()
  if (root) {
    root.scrollTo({ top, left: 0, behavior })
    return
  }
  window.scrollTo({ top, left: 0, behavior })
}

export const resetAppScroll = (behavior: ScrollBehavior = 'auto'): void => {
  scrollAppTo(0, behavior)
  if (typeof document === 'undefined') return
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}
