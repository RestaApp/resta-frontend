import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setInitData, setReady } from '@/features/navigation/model/telegramSlice'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { authService } from '@/services/auth'
import { usersApi } from '@/services/api/usersApi'
import { useAuthActions } from '@/hooks/useAuth'
import { updateUserDataInStore } from '@/utils/userData'
import { getTelegramWebApp, getTelegramLanguageCode, isTelegramWebApp } from '@/utils/telegram'
import i18n, { telegramCodeToLocale, type Locale } from '@/shared/i18n/config'
import { STORAGE_KEYS } from '@/constants/storage'
import { getLocalStorageItem } from '@/utils/localStorage'
import type { UserData } from '@/services/api/authApi'
import { configureTelegram, type TelegramWebApp } from './utils'

/**
 * In‑flight guard защищает от двойного логина при StrictMode и параллельных
 * вызовах. Хранится на module level — общая на все провайдеры (в нашем приложении один).
 */
let loginPromise: Promise<TelegramWebApp | null> | null = null

const applyLanguage = async (userData: UserData | null) => {
  // 1) localStorage явно выбранный пользователем язык — приоритет.
  const saved = getLocalStorageItem(STORAGE_KEYS.LOCALE)
  if (saved === 'ru' || saved === 'en') {
    await i18n.changeLanguage(saved)
    return
  }
  // 2) Язык из профиля.
  const userLang = userData?.language
  const localeFromUser: Locale | null =
    userLang === 'ru' || userLang === 'en' ? (userLang as Locale) : null
  if (localeFromUser) {
    await i18n.changeLanguage(localeFromUser)
    return
  }
  // 3) Telegram device language.
  await i18n.changeLanguage(telegramCodeToLocale(getTelegramLanguageCode()))
}

const getInitData = async (): Promise<string | null> => {
  const webApp = getTelegramWebApp()
  if (webApp?.initData) return webApp.initData
  if (import.meta.env.DEV) {
    const { MOCK_INIT_DATA } = await import('@/config/telegram')
    return MOCK_INIT_DATA
  }
  return null
}

interface UseTelegramAuthResult {
  isReady: boolean
  telegram: TelegramWebApp | null
  fullscreenRequestedRef: React.MutableRefObject<boolean>
}

/**
 * Lifecycle инициализации Telegram WebApp + sign‑in:
 *  • fast‑path — есть валидный токен и userData → ready без sign_in;
 *  • init     — sign_in через initData (или мок в dev), затем `configureTelegram`;
 *  • в браузере без TG (prod) — приложение всё равно поднимается.
 *
 * Возвращает только наблюдаемое состояние; lifecycle эффекты внутри.
 */
export const useTelegramAuth = (): UseTelegramAuthResult => {
  const dispatch = useAppDispatch()
  const userDataFromStore = useAppSelector(selectUserData)
  const { authTelegram } = useAuthActions()

  const [isReady, setIsReady] = useState(false)
  const [telegram, setTelegram] = useState<TelegramWebApp | null>(null)
  const fullscreenRequestedRef = useRef(false)

  // Держим актуальную ссылку на authTelegram, чтобы effect ниже не перезапускался.
  const authTelegramRef = useRef(authTelegram)
  authTelegramRef.current = authTelegram

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
          /* ignore */
        }
      }
    },
    [dispatch]
  )

  const performLogin = useCallback(async (): Promise<TelegramWebApp | null> => {
    const webApp = getTelegramWebApp()

    if (!import.meta.env.DEV && !webApp) {
      throw new Error('Telegram WebApp not found')
    }

    // 1) Если токен валиден — пробуем подтянуть пользователя.
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
          /* fallback на sign_in ниже */
        }
      }
    }

    // 2) sign_in через initData.
    const initData = await getInitData()
    if (!initData) throw new Error('initData not found')

    dispatch(setInitData(initData))
    await authTelegramRef.current({ initData })
    return webApp
  }, [dispatch, loadUserById, userDataFromStore?.id])

  const loginOnce = useCallback(async (): Promise<TelegramWebApp | null> => {
    if (!loginPromise) {
      loginPromise = performLogin().finally(() => {
        loginPromise = null
      })
    }
    return loginPromise
  }, [performLogin])

  /** Fast‑path: токен валиден + userData есть → готовы без sign_in. */
  useEffect(() => {
    if (isReady) return
    if (!authService.isTokenValid() || !userDataFromStore?.id) return

    void (async () => {
      await applyLanguage(userDataFromStore as UserData)
      const webApp = getTelegramWebApp()
      const { fullscreenRequested } = configureTelegram(webApp, fullscreenRequestedRef.current)
      fullscreenRequestedRef.current = fullscreenRequested
      setTelegram(webApp ?? null)
      setIsReady(true)
      dispatch(setReady(true))
    })()
  }, [dispatch, isReady, userDataFromStore])

  /** Init/login один раз. */
  useEffect(() => {
    if (isReady) return
    let mounted = true

    const init = async () => {
      try {
        // Не Telegram (prod) → просто помечаем ready (приложение должно жить в браузере).
        if (!import.meta.env.DEV && !isTelegramWebApp()) {
          if (!mounted) return
          setIsReady(true)
          dispatch(setReady(true))
          return
        }

        const webApp = await loginOnce()
        if (!mounted) return

        const { fullscreenRequested } = configureTelegram(webApp, fullscreenRequestedRef.current)
        fullscreenRequestedRef.current = fullscreenRequested
        setTelegram(webApp ?? null)
        setIsReady(true)
        dispatch(setReady(true))
      } catch {
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
  }, [dispatch, isReady, loginOnce])

  return { isReady, telegram, fullscreenRequestedRef }
}
