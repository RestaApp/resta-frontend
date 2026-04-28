interface TelegramWebApp {
  version?: string
  isVersionAtLeast?: (version: string) => boolean
  isActive?: boolean
  isVerticalSwipesEnabled?: boolean
  isFullscreen?: boolean
  isOrientationLocked?: boolean
  safeAreaInset?: { top: number; bottom: number; left: number; right: number }
  contentSafeAreaInset?: { top: number; bottom: number; left: number; right: number }
  onEvent?: (
    eventType:
      | 'activated'
      | 'deactivated'
      | 'safeAreaChanged'
      | 'contentSafeAreaChanged'
      | 'fullscreenChanged'
      | 'fullscreenFailed',
    callback: () => void
  ) => void
  offEvent?: (
    eventType:
      | 'activated'
      | 'deactivated'
      | 'safeAreaChanged'
      | 'contentSafeAreaChanged'
      | 'fullscreenChanged'
      | 'fullscreenFailed',
    callback: () => void
  ) => void
  ready: () => void
  expand: () => void
  enableClosingConfirmation?: () => void
  disableVerticalSwipes?: () => void
  requestFullscreen?: () => void
  exitFullscreen?: () => void
  setBackgroundColor?: (color: string) => void
  setHeaderColor?: (color: string) => void
  lockOrientation?: () => void
  unlockOrientation?: () => void
  initData?: string
  initDataUnsafe?: {
    user?: {
      id: number
      first_name?: string
      last_name?: string
      username?: string
      /** Код языка интерфейса Telegram у пользователя (например ru, en) */
      language_code?: string
    }
  }
  requestContact?: (callback?: (shared: boolean) => void) => void
  LocationManager?: {
    isInited?: boolean
    init?: (callback?: () => void) => void
    getLocation?: (
      callback: (
        location: {
          latitude: number
          longitude: number
        } | null
      ) => void
    ) => void
    openSettings?: () => void
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
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void
  showPopup?: (
    params: {
      title?: string
      message: string
      buttons?: Array<{
        id?: string
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
        text?: string
      }>
    },
    callback?: (buttonId: string | null) => void
  ) => void
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

const getTelegramUser = () => {
  const webApp = getTelegramWebApp()
  return webApp?.initDataUnsafe?.user ?? null
}

/**
 * Возвращает код языка устройства из Telegram (например 'ru', 'en').
 * В режиме разработки или без Telegram возвращает null.
 */
export const getTelegramLanguageCode = (): string | null => {
  const user = getTelegramUser()
  const code = user?.language_code
  if (typeof code === 'string' && code.length >= 2) return code.toLowerCase().slice(0, 2)
  return null
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

export const requestTelegramContact = async (): Promise<boolean> => {
  const webApp = getTelegramWebApp()
  if (!webApp?.requestContact) return false

  return new Promise(resolve => {
    try {
      webApp.requestContact?.(shared => resolve(Boolean(shared)))
    } catch {
      resolve(false)
    }
  })
}

export const requestTelegramLocation = async (): Promise<{
  latitude: number
  longitude: number
} | null> => {
  const webApp = getTelegramWebApp()
  const manager = webApp?.LocationManager
  if (!manager?.getLocation) return null

  const getLocation = () =>
    new Promise<{ latitude: number; longitude: number } | null>(resolve => {
      try {
        manager.getLocation?.(location => resolve(location))
      } catch {
        resolve(null)
      }
    })

  try {
    if (!manager.isInited && manager.init) {
      await new Promise<void>(resolve => {
        manager.init?.(() => resolve())
      })
    }
    return await getLocation()
  } catch {
    return null
  }
}
