import { useState } from 'react'
import { useAppSelector } from '@/app/hooks'
import { RoleSelector } from '@/features/role-selector/ui/RoleSelector'
import { Dashboard } from '@/pages/Dashboard'
import { LoadingPage } from '@/pages/applications/components/Loading/LoadingPage'
import { useRole } from '@/hooks/useRole'
import { useNavigation } from '@/hooks/useNavigation'
import { useAuth } from '@/contexts/AuthContext'
import type { Screen, UiRole } from '@/types'
import { ROUTES } from '@/constants/routes'
import { selectUserData } from '@/features/navigation/model/userSlice'

export const App = () => {
  const { isLoading } = useAuth()
  const { selectedRole, handleRoleSelect } = useRole()
  const userData = useAppSelector(selectUserData)

  const [currentScreen, setCurrentScreen] = useState<Screen>(ROUTES.HOME)
  const { navigate } = useNavigation({ setCurrentScreen })

  const onSelectRole = (role: UiRole) => {
    handleRoleSelect(role)
    setCurrentScreen(ROUTES.HOME)
  }

  if (isLoading && !userData) return <LoadingPage />
  if (!selectedRole) return <RoleSelector onSelectRole={onSelectRole} />

  return (
    <div className="min-h-screen bg-background">
      <Dashboard role={selectedRole} onNavigate={navigate} currentScreen={currentScreen} />
    </div>
  )
}