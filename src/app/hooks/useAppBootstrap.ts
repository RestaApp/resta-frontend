/**
 * Единая точка решения: что показывать (loading / role / onboarding_done / dashboard).
 * Один источник истины: userData + selectedRole из Redux.
 */

import { useState, useCallback } from 'react'
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

export type AppScreen = 'loading' | 'role' | 'onboarding_done' | 'dashboard'

export function useAppBootstrap() {
  const { isLoading } = useAuth()
  const userData = useAppSelector(selectUserData)
  const selectedRole = useAppSelector(selectSelectedRole)
  const dispatch = useAppDispatch()
  const { updateUiRole } = useUserUpdate()

  const [currentScreen, setCurrentScreen] = useState<Screen>(ROUTES.HOME)
  const [showOnboardingComplete, setShowOnboardingComplete] = useState(false)
  const [pendingRole, setPendingRole] = useState<UiRole | null>(null)

  const screen: AppScreen =
    isLoading && !userData
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
