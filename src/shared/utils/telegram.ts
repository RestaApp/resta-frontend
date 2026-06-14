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
      | 'viewportChanged'
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
      | 'viewportChanged'
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
    notificationOccurred?: (type: 'error' | 'success' | 'warning') => void
    selectionChanged?: () => void
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

type TelegramBackButtonHandler = {
  id: number
  onBack: () => void
}

let telegramBackButtonHandlerId = 0
let telegramBackButtonHandlers: TelegramBackButtonHandler[] = []
let telegramBackButtonWebApp: TelegramWebApp | null = null
let telegramBackButtonBound = false
let telegramBackButtonVisible = false

const isTelegramVersionAtLeast = (webApp: TelegramWebApp, target: string): boolean => {
  if (webApp.isVersionAtLeast) return webApp.isVersionAtLeast(target)
  const current = typeof webApp.version === 'string' ? webApp.version : null
  if (!current) return false
  const parse = (value: string) => value.split('.').map(part => Number(part))
  const currentParts = parse(current)
  const targetParts = parse(target)
  const length = Math.max(currentParts.length, targetParts.length)
  for (let index = 0; index < length; index += 1) {
    const currentPart = currentParts[index] ?? 0
    const targetPart = targetParts[index] ?? 0
    if (currentPart > targetPart) return true
    if (currentPart < targetPart) return false
  }
  return true
}

const isTelegramBackButtonSupported = (webApp: TelegramWebApp): boolean =>
  isTelegramVersionAtLeast(webApp, '6.1')

export const triggerTelegramBack = (): boolean => {
  const activeHandler = telegramBackButtonHandlers.at(-1)
  if (!activeHandler) return false
  try {
    telegramBackButtonWebApp?.HapticFeedback?.impactOccurred('light')
  } catch {
    // ignore
  }
  activeHandler.onBack()
  return true
}

const handleTelegramBackButtonClick = () => {
  triggerTelegramBack()
}

const bindTelegramBackButton = (webApp: TelegramWebApp) => {
  if (telegramBackButtonBound && telegramBackButtonWebApp === webApp) return

  if (telegramBackButtonBound && telegramBackButtonWebApp) {
    try {
      telegramBackButtonWebApp.BackButton.offClick(handleTelegramBackButtonClick)
    } catch {
      // ignore
    }
  }

  try {
    webApp.BackButton.onClick(handleTelegramBackButtonClick)
    telegramBackButtonWebApp = webApp
    telegramBackButtonBound = true
  } catch {
    telegramBackButtonWebApp = null
    telegramBackButtonBound = false
  }
}

const syncTelegramBackButton = (webApp: TelegramWebApp) => {
  if (!isTelegramBackButtonSupported(webApp)) return

  try {
    if (telegramBackButtonHandlers.length > 0) {
      bindTelegramBackButton(webApp)
      if (!telegramBackButtonVisible) {
        webApp.BackButton.show()
        telegramBackButtonVisible = true
      }
      return
    }

    if (telegramBackButtonBound) {
      webApp.BackButton.offClick(handleTelegramBackButtonClick)
    }
    if (telegramBackButtonVisible) {
      webApp.BackButton.hide()
      telegramBackButtonVisible = false
    }
    telegramBackButtonWebApp = null
    telegramBackButtonBound = false
  } catch {
    // ignore
  }
}

export const setupTelegramBackButton = (onBack: () => void) => {
  const webApp = getTelegramWebApp()
  if (!webApp) return () => {}
  const handler: TelegramBackButtonHandler = {
    id: ++telegramBackButtonHandlerId,
    onBack,
  }
  let cleanedUp = false

  telegramBackButtonHandlers = [...telegramBackButtonHandlers, handler]
  syncTelegramBackButton(webApp)

  return () => {
    if (cleanedUp) return
    cleanedUp = true
    telegramBackButtonHandlers = telegramBackButtonHandlers.filter(item => item.id !== handler.id)
    syncTelegramBackButton(webApp)
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
