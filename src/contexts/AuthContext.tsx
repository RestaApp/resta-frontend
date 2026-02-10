import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '@/services/auth'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearUserData } from '@/features/navigation/model/userSlice'
import { selectTelegramIsReady } from '@/features/navigation/model/telegramSlice'

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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch()
  const telegramReady = useAppSelector(selectTelegramIsReady)

  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated())
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const checkAuth = () => {
    const next = authService.isAuthenticated()
    setIsAuthenticated((prev) => (prev === next ? prev : next))
  }

  useEffect(() => {
    // initial
    checkAuth()

    const onUnauthorized = () => {
      setIsAuthenticated(false)
      setIsError(true)
      setError(new Error('Unauthorized'))
    }

    const onAuthorized = () => {
      checkAuth()
      setIsError(false)
      setError(null)
    }

    const onLogout = () => {
      setIsAuthenticated(false)
      setIsError(false)
      setError(null)
      dispatch(clearUserData())
    }

    const onFocus = () => checkAuth()

    window.addEventListener('auth:unauthorized', onUnauthorized)
    window.addEventListener('auth:authorized', onAuthorized)
    window.addEventListener('auth:logout', onLogout)
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('auth:unauthorized', onUnauthorized)
      window.removeEventListener('auth:authorized', onAuthorized)
      window.removeEventListener('auth:logout', onLogout)
      window.removeEventListener('focus', onFocus)
    }
  }, [dispatch])

  // когда Telegram “готов”, можно уточнить auth и сбросить ошибку, если всё ок
  useEffect(() => {
    if (!telegramReady) return
    const next = authService.isAuthenticated()
    setIsAuthenticated(next)
    if (next) {
      setIsError(false)
      setError(null)
    }
  }, [telegramReady])

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading: !telegramReady,
      isError,
      error,
      isAuthenticated,
    }),
    [telegramReady, isError, error, isAuthenticated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}