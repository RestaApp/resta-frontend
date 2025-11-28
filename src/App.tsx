import { useState } from 'react'
import { RoleSelector } from './pages/role-selector'
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
import { Toaster } from './components/ui/sonner'
import { useRole } from './hooks/useRole'
import { useNavigation } from './hooks/useNavigation'
import { useAuth } from './contexts/AuthContext'
import type { Tab, Screen } from './types'
import { ROUTES } from './constants/routes'

export default function App() {
  // Используем глобальное состояние авторизации (авторизация происходит в AuthProvider)
  useAuth()
  const { selectedRole, handleRoleSelect, handleRoleReset } = useRole()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [currentScreen, setCurrentScreen] = useState<Screen>(ROUTES.HOME)

  const { navigate, back } = useNavigation({
    setCurrentScreen,
    setActiveTab,
  })

  const handleRoleSelectWithReset = (role: Parameters<typeof handleRoleSelect>[0]) => {
    handleRoleSelect(role)
    setActiveTab('home')
    setCurrentScreen(ROUTES.HOME)
  }

  const handleTabChange = (tab: string) => {
    const tabValue = tab as Tab
    setActiveTab(tabValue)
    if (['vacancies', 'shifts', 'notifications', 'profile', 'home'].includes(tab)) {
      setCurrentScreen(tab as Screen)
    }
  }

  const handleCreateShift = () => {
    // TODO: Добавить toast уведомление об успешной публикации
    back()
  }

  // Экран выбора роли
  if (!selectedRole) {
    return (
      <>
        <RoleSelector onSelectRole={handleRoleSelectWithReset} />
        <Toaster />
      </>
    )
  }

  // Рендеринг экранов на основе текущего экрана и роли
  const renderScreen = () => {
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
        return <NotificationsScreen onBack={back} role={selectedRole} />

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
  }

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      {currentScreen !== ROUTES.PROFILE && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} role={selectedRole} />
      )}
      <Toaster />
    </div>
  )
}
