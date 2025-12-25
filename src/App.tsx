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
import type { Tab, Screen, UserRole } from './types'
import { ROUTES } from './constants/routes'

export const App = () => {
  const { isLoading } = useAuth()
  const { selectedRole, handleRoleSelect } = useRole()
  const userData = useAppSelector(state => state.user.userData)
  const [currentScreen, setCurrentScreen] = useState<Screen>(ROUTES.HOME)

  const noopSetActiveTab = (_tab: Tab) => { }

  const { navigate } = useNavigation({
    setCurrentScreen,
    setActiveTab: noopSetActiveTab,
  })

  const handleRoleSelectWithReset = useCallback(
    (role: UserRole) => {
      handleRoleSelect(role)
      noopSetActiveTab('feed')
      setCurrentScreen(ROUTES.HOME)
    },
    [handleRoleSelect]
  )

  // Временная функция для создания смены — пока не используется

  // Рендеринг: пока поддерживаем только экран поиска (Dashboard) и выбор роли
  const renderedScreen = selectedRole ? (
    <Dashboard role={selectedRole as UserRole} onNavigate={navigate} currentScreen={currentScreen} />
  ) : (
    <RoleSelector onSelectRole={handleRoleSelectWithReset} />
  )

  // Показываем экран загрузки только если:
  // 1. Идет загрузка И данных пользователя еще нет
  // 2. Если userData уже есть, значит sign_in завершен - переходим к выбору роли
  if (isLoading && !userData) {
    return <LoadingPage />
  }

  // Экран выбора роли (если роль не выбрана или unverified)
  // После завершения sign_in с role: "unverified" selectedRole будет null
  if (!selectedRole) {
    return <RoleSelector onSelectRole={handleRoleSelectWithReset} />
  }

  return (
    <div className="min-h-screen bg-background">
      {renderedScreen}
    </div>
  )
}
