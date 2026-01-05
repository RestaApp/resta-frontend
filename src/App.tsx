/**
 * Главный компонент приложения
 * Управляет роутингом, навигацией и состоянием роли пользователя
 */

import { useState, useCallback } from 'react'
import { useAppSelector } from './store/hooks'
import { RoleSelector } from './pages/RoleSelector/RoleSelector'
import { Dashboard } from './pages/Dashboard'
import { LoadingPage } from './pages/applications/components/Loading/LoadingPage'
import { useRole } from './hooks/useRole'
import { useNavigation } from './hooks/useNavigation'
import { useAuth } from './contexts/AuthContext'
import type { Screen, UiRole } from './types'
import { ROUTES } from './constants/routes'

export const App = () => {
  const { isLoading } = useAuth()
  const { selectedRole, handleRoleSelect } = useRole()
  const userData = useAppSelector(state => state.user.userData)
  const [currentScreen, setCurrentScreen] = useState<Screen>(ROUTES.HOME)

  const { navigate } = useNavigation({ setCurrentScreen })

  const handleRoleSelectWithReset = useCallback(
    (role: UiRole) => {
      handleRoleSelect(role)
      setCurrentScreen(ROUTES.HOME)
    },
    [handleRoleSelect]
  )

  if (isLoading && !userData) return <LoadingPage />
  if (!selectedRole) return <RoleSelector onSelectRole={handleRoleSelectWithReset} />

  return (
    <div className="min-h-screen bg-background">
      <Dashboard role={selectedRole} onNavigate={navigate} currentScreen={currentScreen} />
    </div>
  )
}