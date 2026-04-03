/**
 * Единая точка решения: что показывать (loading / role / onboarding_done / dashboard).
 * Один источник истины: userData + selectedRole из Redux.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectUserData,
  selectSelectedRole,
  setSelectedRole,
} from '@/features/navigation/model/userSlice'
import { useAuth } from '@/contexts/auth'
import { ROUTES } from '@/constants/routes'
import type { Screen, UiRole } from '@/types'
import { useUserUpdate } from '@/features/role-selector/model/useUserUpdate'
import { mapRoleFromApi, mapUiRoleToApiRole } from '@/utils/roles'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'

export type AppScreen = 'loading' | 'role' | 'onboarding_done' | 'dashboard'

const POST_LOGOUT_LOADING_MS = 2000

export function useAppBootstrap() {
  const { isLoading } = useAuth()
  const userData = useAppSelector(selectUserData)
  const selectedRole = useAppSelector(selectSelectedRole)
  const dispatch = useAppDispatch()
  const { updateUiRole } = useUserUpdate()

  const [currentScreen, setCurrentScreen] = useState<Screen>(ROUTES.HOME)
  const [showOnboardingComplete, setShowOnboardingComplete] = useState(false)
  const [pendingRole, setPendingRole] = useState<UiRole | null>(null)
  const [postLogoutLoading, setPostLogoutLoading] = useState(false)
  const logoutTimerRef = useRef<number | null>(null)

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

  const screen: AppScreen =
    (isLoading && !userData) || (postLogoutLoading && !selectedRole)
      ? 'loading'
      : !selectedRole
        ? 'role'
        : showOnboardingComplete
          ? 'onboarding_done'
          : 'dashboard'

  const navigate = useCallback((s: Screen) => setCurrentScreen(s), [])

  const onSelectRole = useCallback(
    (role: UiRole) => {
      dispatch(setSelectedRole(role))
      setPendingRole(role)
      setShowOnboardingComplete(true)
    },
    [dispatch]
  )

  const onOnboardingComplete = useCallback(async () => {
    if (pendingRole) {
      const currentApiRole = mapRoleFromApi(userData?.role)
      const desiredApiRole = mapUiRoleToApiRole(pendingRole)
      if (currentApiRole !== desiredApiRole) {
        await updateUiRole(pendingRole, () => {})
      }
      setPendingRole(null)
    }
    setShowOnboardingComplete(false)
    setCurrentScreen(ROUTES.HOME)
  }, [pendingRole, updateUiRole, userData?.role])

  return {
    screen,
    role: selectedRole,
    currentScreen,
    navigate,
    onSelectRole,
    onOnboardingComplete,
  }
}
