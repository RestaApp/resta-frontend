import { useCallback, useSyncExternalStore } from 'react'
import { getTelegramWebApp } from '@/shared/utils/telegram'
import { isIosDevice, type TelegramWebApp } from './utils'

interface UseTelegramFullscreenResult {
  isFullscreen: boolean
  requestFullscreen: () => void
}

const NO_OP_UNSUBSCRIBE = () => {}

/**
 * Подписка на `viewportChanged` (как в эталонной реализации) через
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
        telegram.onEvent('viewportChanged', notify)
      } catch {
        return NO_OP_UNSUBSCRIBE
      }
      return () => {
        try {
          telegram.offEvent?.('viewportChanged', notify)
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
    if (!isIosDevice()) return
    const webApp = telegram ?? getTelegramWebApp()
    if (!webApp) return
    try {
      webApp.requestFullscreen?.()
    } catch {
      /* ignore */
    }
  }, [telegram])

  return { isFullscreen, requestFullscreen }
}
