/**
 * Контекст для глобального состояния авторизации
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { getTelegramInitData, isTelegramWebApp } from '../utils/telegram'
import { authService } from '../services/auth'
import { logger } from '../utils/logger'
import { useAuthActions } from '../hooks/useAuth'

interface AuthContextValue {
  isLoading: boolean
  isError: boolean
  error: unknown
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Провайдер для глобального состояния авторизации
 * Должен быть обернут вокруг всего приложения
 */
// Глобальный флаг для предотвращения дублирования запросов авторизации
// Используется вне компонента, чтобы работать даже в StrictMode
let globalAuthAttempted = false

export function AuthProvider({ children }: AuthProviderProps) {
  const { authTelegram, isLoading } = useAuthActions()
  const hasAttemptedAuth = useRef(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated())
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<unknown>(null)

  // Отслеживаем изменения авторизации
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated())
    }

    // Проверяем при монтировании
    checkAuth()

    // Слушаем события авторизации
    const handleAuthChange = () => checkAuth()
    const handleLogout = async () => {
      checkAuth()
      // Очищаем данные пользователя из Redux
      const { clearUserData } = await import('../store/userSlice')
      const { store } = await import('../store')
      store.dispatch(clearUserData())
    }

    window.addEventListener('auth:unauthorized', handleAuthChange)
    window.addEventListener('auth:authorized', handleAuthChange)
    window.addEventListener('auth:logout', handleLogout)

    // Также проверяем при фокусе окна (на случай, если токен был сохранен в другой вкладке)
    window.addEventListener('focus', checkAuth)

    return () => {
      window.removeEventListener('auth:unauthorized', handleAuthChange)
      window.removeEventListener('auth:authorized', handleAuthChange)
      window.removeEventListener('auth:logout', handleLogout)
      window.removeEventListener('focus', checkAuth)
    }
  }, [])

  // Автоматическая авторизация при монтировании
  useEffect(() => {
    // Предотвращаем повторные попытки авторизации (защита от StrictMode и множественных вызовов)
    if (hasAttemptedAuth.current || globalAuthAttempted || isLoading) {
      return
    }

    // Авторизуем только если пользователь еще не авторизован
    if (authService.isAuthenticated()) {
      return
    }

    // В режиме разработки авторизуем даже без Telegram Web App
    // В production авторизуем только в Telegram Web App
    if (!import.meta.env.DEV && !isTelegramWebApp()) {
      return
    }

    const initData = getTelegramInitData()
    if (!initData) {
      logger.warn('initData не найден')
      return
    }

    // Помечаем, что попытка авторизации была сделана (локально и глобально)
    hasAttemptedAuth.current = true
    globalAuthAttempted = true

    logger.log('Используем initData для авторизации:', initData)

    // Выполняем авторизацию
    authTelegram({ initData })
      .then(result => {
        logger.log('Авторизация успешна:', result)
        // Обновляем состояние после успешной авторизации
        setIsAuthenticated(true)
        setIsError(false)
        setError(null)
      })
      .catch(err => {
        logger.error('Ошибка авторизации через Telegram:', err)
        // Сбрасываем флаги при ошибке, чтобы можно было повторить попытку
        hasAttemptedAuth.current = false
        globalAuthAttempted = false
        setIsAuthenticated(false)
        setIsError(true)
        setError(err)
      })
  }, [authTelegram, isLoading])

  const value: AuthContextValue = {
    isLoading,
    isError,
    error,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Хук для использования состояния авторизации
 * Использует глобальный контекст, предотвращая дублирование запросов
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}

