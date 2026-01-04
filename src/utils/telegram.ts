import { MOCK_INIT_DATA, USE_MOCK_INIT_DATA } from '@/config/telegram'

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  initData?: string
  initDataUnsafe?: {
    user?: {
      id: number
      first_name?: string
      last_name?: string
      username?: string
    }
  }
  BackButton: {
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  }
}

interface TelegramWindow extends Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
}

export const isTelegramWebApp = (): boolean => {
  if (typeof window === 'undefined') return false
  const telegramWindow = window as TelegramWindow
  return telegramWindow.Telegram?.WebApp !== undefined
}

export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (!isTelegramWebApp()) return null
  const telegramWindow = window as TelegramWindow
  return telegramWindow.Telegram?.WebApp ?? null
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
