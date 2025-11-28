import { useState } from 'react'
import { RoleSelector } from './components/RoleSelector'
import { WorkerHome } from './components/WorkerHome'
import { VenueHome } from './components/VenueHome'
import { SupplierHome } from './components/SupplierHome'
import { ShiftsScreen } from './components/ShiftsScreen'
import { VacanciesScreen } from './components/VacanciesScreen'
import { ApplicationsScreen } from './components/ApplicationsScreen'
import { ProfileScreen } from './components/ProfileScreen'
import { NotificationsScreen } from './components/NotificationsScreen'
import { CreateShiftScreen } from './components/CreateShiftScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { SuppliersScreen } from './components/SuppliersScreen'
import { BottomNav } from './components/BottomNav'
import { Toaster } from './components/ui/sonner'
import { useRole } from './hooks/useRole'
import { useNavigation } from './hooks/useNavigation'
import { useAuth } from './hooks/useAuth'
import { isEmployeeRole } from './utils/roles'
import type { Tab, Screen } from './types'
import { ROUTES } from './constants/routes'

export default function App() {
  // Автоматическая авторизация через Telegram
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
        if (isEmployeeRole(selectedRole)) {
          return <WorkerHome onNavigate={navigate} role={selectedRole} />
        } else if (selectedRole === 'venue') {
          return <VenueHome onNavigate={navigate} />
        } else if (selectedRole === 'supplier') {
          return <SupplierHome onNavigate={navigate} />
        }
        break

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
        if (isEmployeeRole(selectedRole)) {
          return <WorkerHome onNavigate={navigate} role={selectedRole} />
        } else if (selectedRole === 'venue') {
          return <VenueHome onNavigate={navigate} />
        } else {
          return <SupplierHome onNavigate={navigate} />
        }
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
