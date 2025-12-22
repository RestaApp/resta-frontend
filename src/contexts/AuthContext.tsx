/**
 * Контекст для глобального состояния авторизации
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authService } from '../services/auth'
import { useAppSelector } from '../store/hooks'

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
export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated())
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const telegramReady = useAppSelector(state => state.telegram.isReady)

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

  // Отслеживаем готовность Telegram и авторизацию
  useEffect(() => {
    // Проверяем авторизацию при изменении готовности Telegram
    if (telegramReady) {
      const isAuth = authService.isAuthenticated()
      setIsAuthenticated(isAuth)
      if (isAuth) {
        setIsError(false)
        setError(null)
      }
    }
  }, [telegramReady])

  const value: AuthContextValue = {
    isLoading: !telegramReady,
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
