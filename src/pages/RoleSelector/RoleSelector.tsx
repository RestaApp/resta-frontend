import { motion } from 'motion/react'
import { RoleCard } from './components/RoleCard'
import { EmployeeSubRoleSelector } from './components/SubRoles/EmployeeSubRoleSelector'
import { SupplierTypeSelector } from './components/SubRoles/SupplierTypeSelector'
import { RestaurantFormatSelector } from './components/SubRoles/RestaurantFormatSelector'
import { useRoleSelector } from './hooks/useRoleSelector'
import type { UserRole, RoleOption } from '../../types'
import type { JSX } from 'react'

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps): JSX.Element {
  const {
    selectedRole,
    showEmployeeSubRoles,
    showSupplierTypes,
    showRestaurantFormats,
    mainRoles,
    isLoading,
    isFetching,
    error,
    employeeSubRoles,
    isLoadingPositions,
    isFetchingPositions,
    supplierTypes,
    isLoadingSupplierTypes,
    isFetchingSupplierTypes,
    restaurantFormats,
    isLoadingRestaurantFormats,
    isFetchingRestaurantFormats,
    selectedSubRole,
    selectedSupplierType,
    selectedRestaurantFormat,
    handleRoleSelect,
    handleSubRoleSelect,
    handleSubRoleContinue,
    handleSupplierTypeSelect,
    handleSupplierTypeContinue,
    handleRestaurantFormatSelect,
    handleRestaurantFormatContinue,
    handleBack,
  } = useRoleSelector({ onSelectRole })

  if (showEmployeeSubRoles) {
    return (
      <EmployeeSubRoleSelector
        currentRole={selectedRole}
        onSelectSubRole={handleSubRoleSelect}
        selectedSubRole={selectedSubRole}
        onContinue={handleSubRoleContinue}
        onBack={handleBack}
        employeeSubRoles={employeeSubRoles}
        isLoading={isLoadingPositions}
        isFetching={isFetchingPositions}
      />
    )
  }

  if (showSupplierTypes) {
    return (
      <SupplierTypeSelector
        onSelectType={handleSupplierTypeSelect}
        selectedType={selectedSupplierType}
        onContinue={handleSupplierTypeContinue}
        onBack={handleBack}
        supplierTypes={supplierTypes}
        isLoading={isLoadingSupplierTypes}
        isFetching={isFetchingSupplierTypes}
      />
    )
  }

  if (showRestaurantFormats) {
    return (
      <RestaurantFormatSelector
        onSelectFormat={handleRestaurantFormatSelect}
        selectedFormat={selectedRestaurantFormat}
        onContinue={handleRestaurantFormatContinue}
        onBack={handleBack}
        restaurantFormats={restaurantFormats}
        isLoading={isLoadingRestaurantFormats}
        isFetching={isFetchingRestaurantFormats}
      />
    )
  }

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Загрузка ролей...</p>
      </div>
    )
  }

  if (!isLoading && !isFetching && (error || mainRoles.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
        <p className="text-muted-foreground">{error ? 'Не удалось загрузить роли' : 'Роли не найдены'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="mb-8">
          <h1 className="text-center text-2xl font-semibold mb-2 text-foreground">Кто вы?</h1>
          <p className="text-center text-muted-foreground">Выберите вашу роль в экосистеме</p>
        </motion.div>

        <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
          {mainRoles.map((role: RoleOption, index: number) => (
            <RoleCard key={role.id} role={role} isSelected={selectedRole === role.id} index={index} onSelect={handleRoleSelect} />
          ))}
        </div>
      </div>
    </div>
  )
}


