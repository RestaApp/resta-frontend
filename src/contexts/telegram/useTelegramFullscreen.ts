import { useCallback, useSyncExternalStore } from 'react'
import { getTelegramWebApp } from '@/utils/telegram'
import { isMobileDevice, isVersionAtLeast, type TelegramWebApp } from './utils'

interface UseTelegramFullscreenResult {
  isFullscreen: boolean
  requestFullscreen: () => void
}

const NO_OP_UNSUBSCRIBE = () => {}

/**
 * Подписка на `fullscreenChanged` / `fullscreenFailed` через
 * `useSyncExternalStore` — концерн "external state mirroring"
 * не требует useEffect/useState и автоматически работает с concurrent rendering.
 */
export const useTelegramFullscreen = (
  telegram: TelegramWebApp | null
): UseTelegramFullscreenResult => {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!telegram?.onEvent) return NO_OP_UNSUBSCRIBE
      try {
        telegram.onEvent('fullscreenChanged', notify)
        telegram.onEvent('fullscreenFailed', notify)
      } catch {
        return NO_OP_UNSUBSCRIBE
      }
      return () => {
        try {
          telegram.offEvent?.('fullscreenChanged', notify)
          telegram.offEvent?.('fullscreenFailed', notify)
        } catch {
          /* ignore */
        }
      }
    },
    [telegram]
  )

  const getSnapshot = useCallback(() => telegram?.isFullscreen ?? false, [telegram])

  const isFullscreen = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const requestFullscreen = useCallback(() => {
    if (!isMobileDevice()) return
    const webApp = telegram ?? getTelegramWebApp()
    if (!webApp) return
    try {
      if (webApp.requestFullscreen && isVersionAtLeast(webApp, '6.1')) {
        webApp.requestFullscreen()
      }
    } catch {
      /* ignore */
    }
  }, [telegram])

  return { isFullscreen, requestFullscreen }
}
