/**
 * Контекст для инициализации Telegram Web App
 * Выполняет авторизацию и настройку Telegram на верхнем уровне
 */

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setInitData, setReady } from '../store/telegramSlice'
import { getTelegramWebApp, isTelegramWebApp } from '../utils/telegram'
import { authService } from '../services/auth'
import { useAuthActions } from '../hooks/useAuth'
import { updateUserDataInStore } from '../utils/userData'
import type { UserData } from '../services/api/authApi'

interface TelegramContextValue {
    isReady: boolean
    telegram: ReturnType<typeof getTelegramWebApp>
}

const TelegramContext = createContext<TelegramContextValue | undefined>(undefined)

interface TelegramProviderProps {
    children: ReactNode
}

/**
 * Провайдер для инициализации Telegram Web App
 * Должен быть обернут вокруг всего приложения на верхнем уровне
 */
// Глобальный флаг для предотвращения дублирования запросов авторизации
// Используется вне компонента, чтобы работать даже в StrictMode
let globalAuthAttempted = false

export function TelegramProvider({ children }: TelegramProviderProps) {
    const dispatch = useAppDispatch()
    const userDataFromStore = useAppSelector(state => state.user.userData)
    const { authTelegram } = useAuthActions()
    const [isReady, setIsReady] = useState(false)
    const [telegram, setTelegram] = useState<ReturnType<typeof getTelegramWebApp>>(null)
    const hasAttemptedAuth = useRef(false)
    // Сохраняем стабильную ссылку на authTelegram, чтобы избежать повторных вызовов
    const authTelegramRef = useRef(authTelegram)
    authTelegramRef.current = authTelegram

    // Функция для получения initData
    const getInitData = async (): Promise<string | null> => {
        const webApp = getTelegramWebApp()
        if (webApp?.initData) {
            return webApp.initData
        }
        // В режиме разработки используем моковые данные
        if (import.meta.env.DEV) {
            const { MOCK_INIT_DATA } = await import('../config/telegram')
            return MOCK_INIT_DATA
        }
        return null
    }

    // Функция для загрузки пользователя по id
    const loadUserById = async (userId: number): Promise<void> => {
        try {
            const { rtkQueryConfig } = await import('../config/rtkQuery')
            const token = authService.getToken()

            if (!token) {
                throw new Error('Token not found')
            }

            const response = await fetch(`${rtkQueryConfig.baseUrl}/api/v1/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to load user')
            }

            const result = (await response.json()) as { success: boolean; data: UserData }

            if (result.success && result.data) {
                updateUserDataInStore(dispatch, result.data)
            } else {
                throw new Error('Failed to load user')
            }
        } catch (error) {
            // Если загрузка не удалась, делаем sign_in
            throw error
        }
    }

    // Функция для выполнения авторизации
    const performLogin = async () => {
        const webApp = getTelegramWebApp()
        if (!webApp && !import.meta.env.DEV) {
            throw new Error('Telegram WebApp not found')
        }

        // Проверяем, валиден ли токен
        const token = authService.getToken()
        const isTokenValid = authService.isTokenValid()

        // Если токен валиден, пытаемся загрузить пользователя по id
        if (isTokenValid && token) {
            // Получаем id из токена или из store
            const userIdFromToken = authService.getUserIdFromToken(token)
            const userId = userIdFromToken ?? userDataFromStore?.id

            if (userId) {
                try {
                    await loadUserById(userId)
                    return webApp
                } catch {
                    // Если загрузка не удалась, продолжаем с sign_in
                }
            }
        }

        // Получаем initData
        const initData = await getInitData()
        if (!initData) {
            throw new Error('initData not found')
        }

        // Сохраняем initData в Redux
        dispatch(setInitData(initData))

        // Выполняем авторизацию (sign_in)
        // Используем ref для гарантии, что используем актуальную функцию
        await authTelegramRef.current({ initData })

        return webApp
    }

    // Функция для настройки Telegram Web App
    const configureTelegram = (webApp: ReturnType<typeof getTelegramWebApp>) => {
        if (!webApp) return

        try {
            // Инициализация Telegram Web App
            webApp.ready()
            webApp.expand()

            // Установка цветов из themeParams
            if (webApp.themeParams?.bg_color) {
                document.documentElement.style.setProperty('--background', webApp.themeParams.bg_color)
            }
        } catch (error) {
            // Ошибка при настройке Telegram Web App
        }
    }

    // Инициализация Telegram и авторизация
    useEffect(() => {
        // Предотвращаем повторные попытки авторизации (защита от StrictMode и множественных вызовов)
        if (hasAttemptedAuth.current || globalAuthAttempted) {
            return
        }

        // Если токен валиден и есть данные пользователя, пропускаем авторизацию
        if (authService.isTokenValid() && userDataFromStore?.id) {
            setIsReady(true)
            dispatch(setReady(true))
            return
        }

        let mounted = true

        const initTelegram = async () => {
            try {
                // В режиме разработки пропускаем проверку Telegram Web App
                if (!import.meta.env.DEV && !isTelegramWebApp()) {
                    setIsReady(true)
                    dispatch(setReady(true))
                    return
                }

                // Помечаем, что попытка авторизации была сделана (локально и глобально)
                hasAttemptedAuth.current = true
                globalAuthAttempted = true

                // Выполняем авторизацию
                const webApp = await performLogin()

                if (!mounted) return

                // Настраиваем Telegram Web App
                if (webApp) {
                    configureTelegram(webApp)
                    setTelegram(webApp)
                }

                dispatch(setReady(true))
                setIsReady(true)
            } catch (error) {
                // Сбрасываем флаги при ошибке, чтобы можно было повторить попытку
                hasAttemptedAuth.current = false
                globalAuthAttempted = false

                if (mounted) {
                    // В режиме разработки все равно помечаем как готово
                    if (import.meta.env.DEV) {
                        setIsReady(true)
                        dispatch(setReady(true))
                    }
                }
            }
        }

        initTelegram()

        return () => {
            mounted = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const value: TelegramContextValue = {
        isReady,
        telegram,
    }

    return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
}

/**
 * Хук для использования Telegram контекста
 */
export function useTelegram(): TelegramContextValue {
    const context = useContext(TelegramContext)
    if (context === undefined) {
        throw new Error('useTelegram должен использоваться внутри TelegramProvider')
    }
    return context
}

