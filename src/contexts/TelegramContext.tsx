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
import { useLockPortrait } from '@/hooks/useLockPortrait'
import { updateUserDataInStore } from '@/utils/userData'
import type { UserData } from '@/services/api/authApi'
import i18n, { telegramCodeToLocale, type Locale } from '@/shared/i18n/config'
import { STORAGE_KEYS } from '@/constants/storage'
import { THEME_CHANGE_EVENT } from '@/utils/theme'

type TelegramWebApp = ReturnType<typeof getTelegramWebApp>

interface TelegramContextValue {
  isReady: boolean
  telegram: TelegramWebApp | null
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

  const applyTelegramColors = useCallback((webApp: TelegramWebApp | null) => {
    if (!webApp) return
    if (typeof document === 'undefined') return

    const style = getComputedStyle(document.documentElement)
    const bg = style.getPropertyValue('--background').trim() || '#ffffff'
    const header = style.getPropertyValue('--card').trim() || bg

    try {
      webApp.setBackgroundColor?.(bg)
    } catch (err) {
      void err
    }

    try {
      webApp.setHeaderColor?.(header)
    } catch (err) {
      void err
    }
  }, [])

  const configureTelegram = useCallback(
    (webApp: TelegramWebApp | null) => {
      if (!webApp) return
      const safe = (fn?: (() => void) | null) => {
        try {
          fn?.()
        } catch (err) {
          void err
        }
      }

      const isVersionAtLeast = (min: string) => {
        if (typeof webApp.isVersionAtLeast === 'function') return webApp.isVersionAtLeast(min)
        const [a1, b1] = String(webApp.version ?? '')
          .split('.')
          .map(Number)
        const [a2, b2] = min.split('.').map(Number)
        return (a1 || 0) > (a2 || 0) || ((a1 || 0) === (a2 || 0) && (b1 || 0) >= (b2 || 0))
      }

      safe(() => webApp.enableClosingConfirmation?.())
      safe(() => webApp.disableVerticalSwipes?.())
      safe(() => webApp.expand())

      if (typeof webApp.requestFullscreen === 'function' && isVersionAtLeast('8.0')) {
        safe(() => webApp.requestFullscreen?.())
      }

      applyTelegramColors(webApp)
      safe(() => webApp.ready())
    },
    [applyTelegramColors]
  )

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

    const run = async () => {
      await applyLanguage(userDataFromStore as UserData)
      setIsReady(true)
      dispatch(setReady(true))
    }

    void run()
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

    const run = async () => {
      try {
        if (!localStorage.getItem(STORAGE_KEYS.LOCALE)) {
          const code = getTelegramLanguageCode()
          await i18n.changeLanguage(telegramCodeToLocale(code))
        }
      } catch {
        // ignore
      }
    }

    void run()
  }, [isReady, userDataFromStore?.id])

  useEffect(() => {
    if (!telegram) return

    const onThemeChange = () => {
      applyTelegramColors(telegram)
    }

    onThemeChange()
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange)
    }
  }, [applyTelegramColors, telegram])

  useLockPortrait(telegram)

  const value = useMemo<TelegramContextValue>(() => ({ isReady, telegram }), [isReady, telegram])

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
}
