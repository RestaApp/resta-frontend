/**
 * Главный компонент приложения
 * Управляет роутингом, навигацией и состоянием роли пользователя
 */

import { useState, useCallback, useMemo } from 'react'
import { useAppSelector } from './store/hooks'
import { RoleSelector } from './pages/RoleSelector/RoleSelector'
import { Home } from './pages/home'
import { ShiftsScreen } from './pages/shifts'
import { VacanciesScreen } from './pages/vacancies'
import { ApplicationsScreen } from './pages/applications'
import { ProfileScreen } from './pages/profile'
import { NotificationsScreen } from './pages/notifications'
import { CreateShiftScreen } from './pages/create-shift'
import { SettingsScreen } from './pages/settings'
import { SuppliersScreen } from './pages/suppliers'
import { BottomNav } from './components/BottomNav'

import { LoadingPage } from './pages/applications/components/Loading/LoadingPage'
import { useRole } from './hooks/useRole'
import { useNavigation } from './hooks/useNavigation'
import { useAuth } from './contexts/AuthContext'
import type { Tab, Screen, UserRole } from './types'
import { ROUTES } from './constants/routes'
import type { JSX } from 'react'

const TABS_WITH_SCREENS: readonly Tab[] = [
  'vacancies',
  'shifts',
  'notifications',
  'profile',
  'home',
] as const

export default function App(): JSX.Element {
  const { isLoading } = useAuth()
  const { selectedRole, handleRoleSelect, handleRoleReset } = useRole()
  const userData = useAppSelector(state => state.user.userData)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [currentScreen, setCurrentScreen] = useState<Screen>(ROUTES.HOME)

  const { navigate, back } = useNavigation({
    setCurrentScreen,
    setActiveTab,
  })

  const handleRoleSelectWithReset = useCallback(
    (role: UserRole) => {
      handleRoleSelect(role)
      setActiveTab('home')
      setCurrentScreen(ROUTES.HOME)
    },
    [handleRoleSelect]
  )

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab)
    if (TABS_WITH_SCREENS.includes(tab)) {
      setCurrentScreen(tab as Screen)
    }
  }, [])

  const handleCreateShift = useCallback(() => {
    // TODO: Добавить toast уведомление об успешной публикации
    back()
  }, [back])

  // Рендеринг экранов на основе текущего экрана и роли
  const renderedScreen = useMemo(() => {
    switch (currentScreen) {
      case ROUTES.HOME:
        return <Home role={selectedRole} onNavigate={navigate} />

      case ROUTES.SHIFTS:
        return <ShiftsScreen onBack={back} onNavigate={navigate} />

      case ROUTES.VACANCIES:
        return <VacanciesScreen onBack={back} onNavigate={navigate} />

      case ROUTES.APPLICATIONS:
        return <ApplicationsScreen onBack={back} />

      case ROUTES.PROFILE:
        return (
          <ProfileScreen
            onNavigate={navigate}
            onBack={handleRoleReset}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )

      case ROUTES.NOTIFICATIONS:
        return <NotificationsScreen onBack={back} role={selectedRole as UserRole} />

      case ROUTES.CREATE_SHIFT:
        return <CreateShiftScreen onBack={back} onSubmit={handleCreateShift} />

      case ROUTES.SETTINGS:
        return <SettingsScreen onBack={back} />

      case ROUTES.SUPPLIERS:
        return <SuppliersScreen onBack={back} />

      case ROUTES.FIND_REPLACEMENT:
        return <CreateShiftScreen onBack={back} onSubmit={handleCreateShift} />

      default:
        return <Home role={selectedRole} onNavigate={navigate} />
    }
  }, [
    currentScreen,
    selectedRole,
    navigate,
    back,
    handleRoleReset,
    activeTab,
    handleTabChange,
    handleCreateShift,
  ])

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
      {currentScreen !== ROUTES.PROFILE && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} role={selectedRole} />
      )}
    </div>
  )
}
