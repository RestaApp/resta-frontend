/**
 * Единая точка решения: что показывать (loading / role / dashboard).
 * Один источник истины: userData + selectedRole из Redux.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectUserData,
  selectSelectedRole,
  setSelectedRole,
} from '@/features/navigation/model/userSlice'
import { useAuth } from '@/app/contexts/auth'
import { ROUTES } from '@/shared/constants/routes'
import type { Screen } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'
import { authService } from '@/services/auth'
import { getPathForScreen, getScreenForPath } from '@/shared/constants/routePaths'

type AppScreen = 'loading' | 'role' | 'dashboard'

const POST_LOGOUT_LOADING_MS = 2000

function resolveAppScreen(params: {
  shouldShowLoading: boolean
  selectedRole: UiRole | null
}): AppScreen {
  const { shouldShowLoading, selectedRole } = params
  if (shouldShowLoading) return 'loading'
  if (!selectedRole) return 'role'
  return 'dashboard'
}

export function useAppBootstrap() {
  const { isLoading } = useAuth()
  const userData = useAppSelector(selectUserData)
  const selectedRole = useAppSelector(selectSelectedRole)
  const dispatch = useAppDispatch()

  const [currentScreen, setCurrentScreen] = useState<Screen>(ROUTES.HOME)
  const [postLogoutLoading, setPostLogoutLoading] = useState(false)
  const logoutTimerRef = useRef<number | null>(null)
  const initialScreenRef = useRef(true)
  const initialPathRef = useRef<string | null>(
    typeof window !== 'undefined' ? window.location.pathname : null
  )

  // После logout кратко показываем LoadingPage, чтобы избежать резкого перехода на RoleSelector.
  useEffect(() => {
    const handleLogout = () => {
      if (logoutTimerRef.current !== null) {
        window.clearTimeout(logoutTimerRef.current)
      }
      setPostLogoutLoading(true)
      logoutTimerRef.current = window.setTimeout(() => {
        setPostLogoutLoading(false)
        logoutTimerRef.current = null
      }, POST_LOGOUT_LOADING_MS)
    }

    const offLogout = onAppEvent(APP_EVENTS.AUTH_LOGOUT, () => handleLogout())
    return () => {
      offLogout()
      if (logoutTimerRef.current !== null) {
        window.clearTimeout(logoutTimerRef.current)
      }
    }
  }, [])

  const shouldShowLoading =
    (isLoading && !userData) ||
    (authService.isAuthenticated() && !userData) ||
    (postLogoutLoading && !selectedRole)

  const screen = resolveAppScreen({
    shouldShowLoading,
    selectedRole,
  })

  const navigate = useCallback((s: Screen) => setCurrentScreen(s), [])

  useEffect(() => {
    if (!selectedRole || typeof window === 'undefined') return

    // На первом проходе после монтирования: если в URL уже есть валидный экран
    // для этой роли — восстанавливаем его, а не перезаписываем URL.
    if (initialScreenRef.current && initialPathRef.current) {
      const screenFromUrl = getScreenForPath(selectedRole, initialPathRef.current)
      initialScreenRef.current = false
      initialPathRef.current = null
      if (screenFromUrl && screenFromUrl !== currentScreen) {
        setCurrentScreen(screenFromUrl)
        return
      }
    }

    const expectedPath = getPathForScreen(selectedRole, currentScreen)
    if (window.location.pathname !== expectedPath) {
      window.history.pushState(null, '', expectedPath)
    }
  }, [currentScreen, selectedRole])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePopState = () => {
      if (!selectedRole) return
      const screenFromPath = getScreenForPath(selectedRole, window.location.pathname)
      if (screenFromPath) {
        setCurrentScreen(screenFromPath)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [selectedRole])

  const onSelectRole = useCallback(
    (role: UiRole) => {
      dispatch(setSelectedRole(role))
      setCurrentScreen(ROUTES.HOME)
    },
    [dispatch]
  )

  return {
    screen,
    role: selectedRole,
    currentScreen,
    navigate,
    onSelectRole,
  }
}
