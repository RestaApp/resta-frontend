import { useEffect } from 'react'
import { getTelegramWebApp } from '@/utils/telegram'

type TelegramWebApp = ReturnType<typeof getTelegramWebApp>

const ORIENTATION_LOCK_MIN_VERSION = '8.0'

const compareVersion = (v: string, min: string) => {
  const [a1, b1] = v.split('.').map(Number)
  const [a2, b2] = min.split('.').map(Number)
  return (a1 || 0) > (a2 || 0) || ((a1 || 0) === (a2 || 0) && (b1 || 0) >= (b2 || 0))
}

const isPortrait = () => window.matchMedia?.('(orientation: portrait)').matches ?? true

export function useLockPortrait(webApp: TelegramWebApp) {
  useEffect(() => {
    if (!webApp) return
    if (typeof webApp.lockOrientation !== 'function') return
    if (typeof webApp.unlockOrientation !== 'function') return
    if (!compareVersion(webApp.version ?? '', ORIENTATION_LOCK_MIN_VERSION)) return

    const lock = () => {
      try {
        webApp.lockOrientation?.()
      } catch (err) {
        void err
      }
    }

    const unlock = () => {
      try {
        webApp.unlockOrientation?.()
      } catch (err) {
        void err
      }
    }

    if (isPortrait()) {
      lock()
      return () => {
        unlock()
      }
    }

    const tryLock = () => {
      if (isPortrait()) {
        lock()
        window.removeEventListener('orientationchange', tryLock)
        window.removeEventListener('resize', tryLock)
      }
    }

    window.addEventListener('orientationchange', tryLock)
    window.addEventListener('resize', tryLock)

    return () => {
      window.removeEventListener('orientationchange', tryLock)
      window.removeEventListener('resize', tryLock)
      unlock()
    }
  }, [webApp])
}
