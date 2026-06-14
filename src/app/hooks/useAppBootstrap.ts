/**
 * Единая точка решения: что показывать (loading / role / dashboard).
 * Один источник истины: userData + selectedRole из Redux.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { useAuth } from '@/app/contexts/auth'
import { ROUTES } from '@/shared/constants/routes'
import { selectSelectedRole, selectUserData, setSelectedRole } from '@/shared/store/user'
import type { Screen } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'
import { authService } from '@/services/auth'
import { getPathForScreen, getScreenForPath } from '@/shared/constants/routePaths'
import { parseDetailPath, buildDetailPath } from '@/shared/navigation/detailPaths'
import { useDetailOverlayInternal } from '@/shared/navigation/overlayContextHooks'

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
  const { setOverlay } = useDetailOverlayInternal()

  const [currentScreen, setCurrentScreen] = useState<Screen>(ROUTES.HOME)
  const [postLogoutLoading, setPostLogoutLoading] = useState(false)
  const logoutTimerRef = useRef<number | null>(null)
  const initialScreenRef = useRef(true)
  const initialPathRef = useRef<string | null>(
    typeof window !== 'undefined' ? window.location.pathname : null
  )

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
    isLoading ||
    (authService.isAuthenticated() && !userData) ||
    (postLogoutLoading && !selectedRole)

  const screen = resolveAppScreen({
    shouldShowLoading,
    selectedRole,
  })

  const navigate = useCallback((s: Screen) => setCurrentScreen(s), [])

  // URL sync: push tab URL when currentScreen changes.
  useEffect(() => {
    if (!selectedRole || typeof window === 'undefined') return

    // On first mount: check if the URL is a detail route or a valid tab screen.
    if (initialScreenRef.current && initialPathRef.current) {
      const initPath = initialPathRef.current
      initialScreenRef.current = false
      initialPathRef.current = null

      const detail = parseDetailPath(initPath)
      if (detail) {
        // Deep link to detail: set base tab URL underneath, push detail on top.
        const basePath = getPathForScreen(selectedRole, ROUTES.HOME)
        window.history.replaceState(null, '', basePath)
        window.history.pushState({ detail: true }, '', buildDetailPath(detail))
        setOverlay(detail)
        return
      }

      const screenFromUrl = getScreenForPath(selectedRole, initPath)
      if (screenFromUrl && screenFromUrl !== currentScreen) {
        setCurrentScreen(screenFromUrl)
        return
      }
    }

    // Don't overwrite the URL if a detail overlay is showing.
    if (parseDetailPath(window.location.pathname)) return

    const expectedPath = getPathForScreen(selectedRole, currentScreen)
    if (window.location.pathname !== expectedPath) {
      window.history.pushState(null, '', expectedPath)
    }
  }, [currentScreen, selectedRole, setOverlay])

  // Popstate: handle both tab and detail URLs.
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePopState = () => {
      const detail = parseDetailPath(window.location.pathname)
      if (detail) {
        setOverlay(detail)
        return
      }

      // Navigated away from a detail route — clear overlay.
      setOverlay(null)

      if (!selectedRole) return
      const screenFromPath = getScreenForPath(selectedRole, window.location.pathname)
      if (screenFromPath) {
        setCurrentScreen(screenFromPath)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [selectedRole, setOverlay])

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
