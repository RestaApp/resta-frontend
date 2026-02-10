/**
 * Единая точка решения: что показывать (loading / role / onboarding_done / dashboard).
 * Один источник истины: userData + selectedRole из Redux.
 */

import { useState, useCallback, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectUserData, selectSelectedRole, setSelectedRole } from '@/features/navigation/model/userSlice'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import type { Screen, UiRole } from '@/types'

export type AppScreen = 'loading' | 'role' | 'onboarding_done' | 'dashboard'

export function useAppBootstrap() {
  const { isLoading } = useAuth()
  const userData = useAppSelector(selectUserData)
  const selectedRole = useAppSelector(selectSelectedRole)
  const dispatch = useAppDispatch()

  const [currentScreen, setCurrentScreen] = useState<Screen>(ROUTES.HOME)
  const [showOnboardingComplete, setShowOnboardingComplete] = useState(false)

  // Сброс онбординга при logout / смене аккаунта (userData пропал)
  useEffect(() => {
    if (!userData) setShowOnboardingComplete(false)
  }, [userData])

  useEffect(() => {
    if (!selectedRole) setShowOnboardingComplete(false)
  }, [selectedRole])

  const screen: AppScreen =
    isLoading && !userData
      ? 'loading'
      : showOnboardingComplete
        ? 'onboarding_done'
        : !selectedRole
          ? 'role'
          : 'dashboard'

  const navigate = useCallback((s: Screen) => setCurrentScreen(s), [])

  const onSelectRole = useCallback((role: UiRole) => {
    dispatch(setSelectedRole(role))
    setShowOnboardingComplete(true)
  }, [dispatch])

  const onOnboardingComplete = useCallback(() => {
    setShowOnboardingComplete(false)
    setCurrentScreen(ROUTES.HOME)
  }, [])

  return {
    screen,
    role: selectedRole,
    currentScreen,
    navigate,
    onSelectRole,
    onOnboardingComplete,
  }
}
