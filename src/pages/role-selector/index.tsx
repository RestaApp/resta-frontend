/**
 * Страница выбора роли
 */

import logo from '../../assets/icons/logo.svg'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { RoleCard } from './components/RoleCard'
import { EmployeeSubRoleSelector } from './components/EmployeeSubRoleSelector'
import { useRoleSelector } from './hooks/useRoleSelector'
import type { UserRole } from '../../types'

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const {
    selectedRole,
    showEmployeeSubRoles,
    selectedSubRole,
    mainRoles,
    isLoading,
    isFetching,
    error,
    roles,
    handleRoleSelect,
    handleContinue,
    handleSubRoleSelect,
    handleSubRoleContinue,
    handleBack,
  } = useRoleSelector({ onSelectRole })

  // Показываем экран выбора подроли для сотрудников
  if (showEmployeeSubRoles) {
    return (
      <EmployeeSubRoleSelector
        currentRole={selectedRole}
        onSelectSubRole={handleSubRoleSelect}
        selectedSubRole={selectedSubRole}
        onContinue={handleSubRoleContinue}
        onBack={handleBack}
        employeeSubRoles={undefined}
      />
    )
  }

  // Показываем загрузку только если пользователь авторизован и данные еще не получены
  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Загрузка ролей...</p>
      </div>
    )
  }

  // Если роли не загружены и пользователь авторизован, показываем сообщение об ошибке
  if (!isLoading && !isFetching) {
    if (error && roles.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Не удалось загрузить роли</p>
        </div>
      )
    }

    if (roles.length > 0 && mainRoles.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Не удалось обработать роли</p>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <Header logo={logo} />

      <div className="flex-1 px-4 pb-32 overflow-y-auto">
        <div className="space-y-3 max-w-md mx-auto">
          {mainRoles.map((role, index) => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={selectedRole === role.id}
              index={index}
              onSelect={handleRoleSelect}
            />
          ))}
        </div>
      </div>

      <Footer selectedRole={selectedRole} onContinue={handleContinue} />
    </div>
  )
}


