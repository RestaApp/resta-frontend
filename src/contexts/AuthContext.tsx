import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '@/services/auth'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearUserData } from '@/features/navigation/model/userSlice'
import { selectTelegramIsReady } from '@/features/navigation/model/telegramSlice'
import { AuthContext, type AuthContextValue } from './auth'

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
    setIsAuthenticated(prev => (prev === next ? prev : next))
  }

  useEffect(() => {
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
