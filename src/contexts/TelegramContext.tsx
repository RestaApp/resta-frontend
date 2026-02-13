import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setInitData, setReady } from '@/features/navigation/model/telegramSlice'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { getTelegramWebApp, getTelegramLanguageCode, isTelegramWebApp } from '@/utils/telegram'
import { authService } from '@/services/auth'
import { usersApi } from '@/services/api/usersApi'
import { useAuthActions } from '@/hooks/useAuth'
import { updateUserDataInStore } from '@/utils/userData'
import type { UserData } from '@/services/api/authApi'
import i18n, { telegramCodeToLocale, type Locale } from '@/shared/i18n/config'
import { STORAGE_KEYS } from '@/constants/storage'

type TelegramWebApp = ReturnType<typeof getTelegramWebApp>

interface TelegramContextValue {
  isReady: boolean
  telegram: TelegramWebApp | null
  isVerticalSwipesEnabled: boolean
  isFullscreen: boolean
  isOrientationLocked: boolean
  requestFullscreen: () => void
}

const TelegramContext = createContext<TelegramContextValue | undefined>(undefined)

interface TelegramProviderProps {
  children: ReactNode
}

/**
 * In-flight guard (защита от StrictMode/двойных маунтов и параллельных вызовов)
 */
let loginPromise: Promise<TelegramWebApp | null> | null = null

export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const dispatch = useAppDispatch()
  const userDataFromStore = useAppSelector(selectUserData)
  const { authTelegram } = useAuthActions()

  const [isReady, setIsReady] = useState(false)
  const [telegram, setTelegram] = useState<TelegramWebApp | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const fullscreenRequestedRef = useRef(false)

  // держим актуальную ссылку на authTelegram
  const authTelegramRef = useRef(authTelegram)
  authTelegramRef.current = authTelegram

  const applyLanguage = useCallback(async (userData: UserData | null) => {
    // 1) localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCALE)
      if (saved === 'ru' || saved === 'en') {
        await i18n.changeLanguage(saved)
        return
      }
    } catch {
      // ignore
    }

    // 2) user profile
    const userLang = userData?.language
    const localeFromUser: Locale | null =
      userLang === 'ru' || userLang === 'en' ? (userLang as Locale) : null
    if (localeFromUser) {
      await i18n.changeLanguage(localeFromUser)
      return
    }

    // 3) device telegram
    const telegramCode = getTelegramLanguageCode()
    await i18n.changeLanguage(telegramCodeToLocale(telegramCode))
  }, [])

  const getInitData = useCallback(async (): Promise<string | null> => {
    const webApp = getTelegramWebApp()
    if (webApp?.initData) return webApp.initData

    if (import.meta.env.DEV) {
      const { MOCK_INIT_DATA } = await import('@/config/telegram')
      return MOCK_INIT_DATA
    }

    return null
  }, [])

  const loadUserById = useCallback(
    async (userId: number): Promise<UserData> => {
      const sub = dispatch(usersApi.endpoints.getUser.initiate(userId))
      try {
        const result = await sub.unwrap()
        return result.data
      } finally {
        try {
          sub.unsubscribe()
        } catch {
          // ignore
        }
      }
    },
    [dispatch]
  )

  const configureTelegram = useCallback((webApp: TelegramWebApp | null) => {
    if (!webApp) return
    try {
      webApp.ready()
      webApp.expand()
      if (!fullscreenRequestedRef.current) {
        fullscreenRequestedRef.current = true
        if (!webApp.isFullscreen) {
          webApp.requestFullscreen?.()
        }
      }
    } catch {
      // в проде тихо, в деве можно логировать
      // if (import.meta.env.DEV) console.debug('Telegram configure failed')
    }
  }, [])

  const performLogin = useCallback(async (): Promise<TelegramWebApp | null> => {
    const webApp = getTelegramWebApp()

    // В проде — только в Telegram, в DEV — разрешаем мок
    if (!import.meta.env.DEV && !webApp) {
      throw new Error('Telegram WebApp not found')
    }

    // 1) Если токен валиден — пробуем подтянуть пользователя
    const token = authService.getToken()
    if (token && authService.isTokenValid()) {
      const userIdFromToken = authService.getUserIdFromToken(token)
      const userId = userIdFromToken ?? userDataFromStore?.id

      if (userId) {
        try {
          const data = await loadUserById(userId)
          updateUserDataInStore(dispatch, data)
          await applyLanguage(data)
          return webApp
        } catch {
          // fallback на sign_in ниже
        }
      }
    }

    // 2) sign_in через initData
    const initData = await getInitData()
    if (!initData) throw new Error('initData not found')

    dispatch(setInitData(initData))
    await authTelegramRef.current({ initData })

    return webApp
  }, [applyLanguage, dispatch, getInitData, loadUserById, userDataFromStore?.id])

  const loginOnce = useCallback(async (): Promise<TelegramWebApp | null> => {
    if (!loginPromise) {
      loginPromise = performLogin().finally(() => {
        loginPromise = null
      })
    }
    return loginPromise
  }, [performLogin])

  /**
   * Fast-path: если уже есть валидный токен и есть userData → считаем готовыми (без sign_in)
   */
  useEffect(() => {
    if (isReady) return
    if (!authService.isTokenValid() || !userDataFromStore?.id) return

    void (async () => {
      await applyLanguage(userDataFromStore as UserData)
      setIsReady(true)
      dispatch(setReady(true))
    })()
  }, [applyLanguage, dispatch, isReady, userDataFromStore])

  /**
   * Init/login один раз
   */
  useEffect(() => {
    if (isReady) return

    let mounted = true

    const init = async () => {
      try {
        // не Telegram (prod) → просто помечаем ready (чтобы приложение жило в браузере)
        if (!import.meta.env.DEV && !isTelegramWebApp()) {
          if (!mounted) return
          setIsReady(true)
          dispatch(setReady(true))
          return
        }

        const webApp = await loginOnce()
        if (!mounted) return

        configureTelegram(webApp)
        setTelegram(webApp ?? null)

        setIsReady(true)
        dispatch(setReady(true))
      } catch {
        // В DEV всё равно даем приложению подняться
        if (!mounted) return
        if (import.meta.env.DEV) {
          setIsReady(true)
          dispatch(setReady(true))
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [configureTelegram, dispatch, isReady, loginOnce])

  /**
   * Если нет userData (не авторизован) — выставляем язык по устройству Telegram, если не зафиксирован в storage
   */
  useEffect(() => {
    if (!isReady) return
    if (userDataFromStore?.id) return

    void (async () => {
      try {
        if (!localStorage.getItem(STORAGE_KEYS.LOCALE)) {
          const code = getTelegramLanguageCode()
          await i18n.changeLanguage(telegramCodeToLocale(code))
        }
      } catch {
        // ignore
      }
    })()
  }, [isReady, userDataFromStore?.id])

  useEffect(() => {
    setIsFullscreen(telegram?.isFullscreen ?? false)
  }, [telegram])

  useEffect(() => {
    if (!telegram?.onEvent) return

    const handleFullscreenChange = () => {
      setIsFullscreen(telegram.isFullscreen ?? false)
    }

    try {
      telegram.onEvent('fullscreenChanged', handleFullscreenChange)
      telegram.onEvent('fullscreenFailed', handleFullscreenChange)
    } catch {
      return
    }

    return () => {
      try {
        telegram.offEvent?.('fullscreenChanged', handleFullscreenChange)
        telegram.offEvent?.('fullscreenFailed', handleFullscreenChange)
      } catch {
        void 0
      }
    }
  }, [telegram])

  const requestFullscreen = useCallback(() => {
    const webApp = telegram ?? getTelegramWebApp()
    if (!webApp) return
    try {
      webApp.requestFullscreen?.()
    } catch {
      void 0
    }
  }, [telegram])

  const isVerticalSwipesEnabled = telegram?.isVerticalSwipesEnabled ?? true
  const isOrientationLocked = telegram?.isOrientationLocked ?? false

  const value = useMemo<TelegramContextValue>(
    () => ({
      isReady,
      telegram,
      isVerticalSwipesEnabled,
      isFullscreen,
      isOrientationLocked,
      requestFullscreen,
    }),
    [
      isReady,
      isFullscreen,
      isOrientationLocked,
      isVerticalSwipesEnabled,
      requestFullscreen,
      telegram,
    ]
  )

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
}
