import { MOCK_INIT_DATA, USE_MOCK_INIT_DATA } from '../config/telegram'

export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && (window as any).Telegram?.WebApp !== undefined
}

export const getTelegramWebApp = () => {
  if (!isTelegramWebApp()) return null
  return (window as any).Telegram.WebApp
}

export const initTelegramWebApp = () => {
  const webApp = getTelegramWebApp()
  if (!webApp) return
  try {
    webApp.ready()
    try {
      webApp.expand()
    } catch {
      // ignore expand failure
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to init Telegram WebApp', err)
  }
}

export const getTelegramInitData = (): string | null => {
  const webApp = getTelegramWebApp()
  if (webApp?.initData) return webApp.initData
  if (USE_MOCK_INIT_DATA) return MOCK_INIT_DATA
  return null
}

export const getTelegramUser = () => {
  const webApp = getTelegramWebApp()
  return webApp?.initDataUnsafe?.user ?? null
}

export const setupTelegramBackButton = (onBack: () => void) => {
  const webApp = getTelegramWebApp()
  if (!webApp) return () => {}
  try {
    webApp.BackButton.show()
    webApp.BackButton.onClick(onBack)
    return () => {
      try {
        webApp.BackButton.hide()
        webApp.BackButton.offClick(onBack)
      } catch {
        // ignore
      }
    }
  } catch {
    return () => {}
  }
}

export const hideTelegramBackButton = () => {
  const webApp = getTelegramWebApp()
  if (!webApp) return
  try {
    webApp.BackButton.hide()
  } catch {
    // ignore
  }
}
