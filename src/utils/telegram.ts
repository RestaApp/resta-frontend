// Telegram Web Apps API utilities

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
        }
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          showProgress: (leaveActive?: boolean) => void
          hideProgress: () => void
          setParams: (params: {
            text?: string
            color?: string
            text_color?: string
            is_active?: boolean
            is_visible?: boolean
          }) => void
        }
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
        initData: string
        initDataUnsafe: {
          query_id?: string
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
            is_premium?: boolean
            photo_url?: string
          }
          auth_date: number
          hash: string
        }
        version: string
        platform: string
        colorScheme: 'light' | 'dark'
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
          secondary_bg_color?: string
        }
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        headerColor: string
        backgroundColor: string
        isClosingConfirmationEnabled: boolean
        onEvent: (eventType: string, eventHandler: () => void) => void
        offEvent: (eventType: string, eventHandler: () => void) => void
        sendData: (data: string) => void
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void
        openTelegramLink: (url: string) => void
        openInvoice: (url: string, callback?: (status: string) => void) => void
        showPopup: (
          params: {
            title?: string
            message: string
            buttons?: Array<{
              id?: string
              type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
              text?: string
            }>
          },
          callback?: (id: string) => void
        ) => void
        showAlert: (message: string, callback?: () => void) => void
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
        showScanQrPopup: (
          params: {
            text?: string
          },
          callback?: (data: string) => void
        ) => void
        closeScanQrPopup: () => void
        readTextFromClipboard: (callback?: (text: string) => void) => void
        requestWriteAccess: (callback?: (granted: boolean) => void) => void
        requestContact: (callback?: (granted: boolean) => void) => void
      }
    }
  }
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined
}

export function getTelegramWebApp() {
  if (!isTelegramWebApp()) {
    return null
  }
  return window.Telegram!.WebApp
}

export function initTelegramWebApp() {
  const webApp = getTelegramWebApp()
  if (webApp) {
    webApp.ready()
    webApp.expand()

    // Логируем initData при инициализации
    console.log('Telegram Web App инициализирован')
    console.log('initData:', webApp.initData)
    console.log('initDataUnsafe:', webApp.initDataUnsafe)

    // Устанавливаем цвет фона приложения через themeParams
    if (webApp.themeParams.bg_color) {
      document.documentElement.style.setProperty('--background', webApp.themeParams.bg_color)
    }
  } else {
    console.log('Telegram Web App не найден')
  }
}

export function setupTelegramBackButton(onBack: () => void) {
  const webApp = getTelegramWebApp()
  if (webApp) {
    webApp.BackButton.show()
    webApp.BackButton.onClick(onBack)

    return () => {
      webApp.BackButton.hide()
      webApp.BackButton.offClick(onBack)
    }
  }
  return () => {}
}

export function hideTelegramBackButton() {
  const webApp = getTelegramWebApp()
  if (webApp) {
    webApp.BackButton.hide()
  }
}

/**
 * Получает initData из Telegram Web App
 * initData - это строка, содержащая данные для авторизации
 */
export function getTelegramInitData(): string | null {
  const webApp = getTelegramWebApp()
  if (!webApp || !webApp.initData) {
    console.log('initData не найден:', { webApp: !!webApp, hasInitData: !!webApp?.initData })
    return null
  }
  console.log('initData получен:', webApp.initData)
  return webApp.initData
}

/**
 * Получает данные пользователя из Telegram (безопасный способ)
 */
export function getTelegramUser() {
  const webApp = getTelegramWebApp()
  if (!webApp || !webApp.initDataUnsafe?.user) {
    return null
  }
  return webApp.initDataUnsafe.user
}
