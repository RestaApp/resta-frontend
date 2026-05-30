import { getTelegramWebApp } from '@/shared/utils/telegram'

export type TelegramWebApp = ReturnType<typeof getTelegramWebApp>

/**
 * Сравнение версии WebApp с целевой (`isVersionAtLeast` появился не сразу,
 * fallback — ручной numeric‑split).
 */
export const isVersionAtLeast = (webApp: TelegramWebApp, target: string): boolean => {
  if (!webApp) return false
  if (webApp.isVersionAtLeast) return webApp.isVersionAtLeast(target)
  const current = typeof webApp.version === 'string' ? webApp.version : null
  if (!current) return false
  const parse = (v: string) => v.split('.').map(p => Number(p))
  const c = parse(current)
  const t = parse(target)
  const len = Math.max(c.length, t.length)
  for (let i = 0; i < len; i++) {
    const a = c[i] ?? 0
    const b = t[i] ?? 0
    if (a > b) return true
    if (a < b) return false
  }
  return true
}

export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
}

export const isIosDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return /iP(hone|ad|od)/i.test(navigator.userAgent || '')
}

/**
 * Конфигурация WebApp при старте: `ready()`, отключение vertical swipes,
 * `expand()`, попытка fullscreen на mobile (только один раз благодаря
 * флагу из вызывающей стороны — см. useTelegramFullscreen).
 */
export const configureTelegram = (
  webApp: TelegramWebApp | null,
  fullscreenAlreadyRequested: boolean
): { fullscreenRequested: boolean } => {
  if (!webApp) return { fullscreenRequested: fullscreenAlreadyRequested }
  let fullscreenRequested = fullscreenAlreadyRequested
  try {
    webApp.ready()
    if (webApp.disableVerticalSwipes && isVersionAtLeast(webApp, '7.7')) {
      webApp.disableVerticalSwipes()
    }
    webApp.expand()
    if (!fullscreenRequested) {
      fullscreenRequested = true
      if (isIosDevice() && !webApp.isFullscreen) {
        try {
          webApp.requestFullscreen?.()
        } catch {
          /* ignore unsupported/fullscreen failure */
        }
      }
    }
  } catch {
    /* в проде тихо */
  }
  return { fullscreenRequested }
}
