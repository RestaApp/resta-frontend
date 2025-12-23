import { RoleCard } from './components/RoleCard'
import { EmployeeSubRoleSelector } from './components/SubRoles/EmployeeSubRoleSelector'
import { SupplierTypeSelector } from './components/SubRoles/SupplierTypeSelector'
import { RestaurantFormatSelector } from './components/SubRoles/RestaurantFormatSelector'
import { SectionHeader } from '../../components/ui/section-header'
import { LoadingState } from './components/SubRoles/components/LoadingState'
import { ErrorModal } from './components/ErrorModal'
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
    handleRoleSelect,
    handleSubRoleSelect,
    handleSubRoleContinue,
    handleSupplierTypeContinue,
    handleRestaurantFormatContinue,
    handleBack,
    errorDialogOpen,
    setErrorDialogOpen,
    errorMessage,
  } = useRoleSelector({ onSelectRole })

  if (showEmployeeSubRoles) {
    return (
      <>
        <EmployeeSubRoleSelector
          onSelectSubRole={handleSubRoleSelect}
          selectedSubRole={selectedSubRole}
          onContinue={handleSubRoleContinue}
          onBack={handleBack}
          employeeSubRoles={employeeSubRoles}
          isLoading={isLoadingPositions}
          isFetching={isFetchingPositions}
          errorDialogOpen={errorDialogOpen}
        />
        <ErrorModal
          isOpen={errorDialogOpen}
          onClose={() => setErrorDialogOpen(false)}
          message={errorMessage}
        />
      </>
    )
  }

  if (showSupplierTypes) {
    return (
      <>
        <SupplierTypeSelector
          onContinue={handleSupplierTypeContinue}
          onBack={handleBack}
          supplierTypes={supplierTypes}
          isLoading={isLoadingSupplierTypes}
          isFetching={isFetchingSupplierTypes}
        />
        <ErrorModal
          isOpen={errorDialogOpen}
          onClose={() => setErrorDialogOpen(false)}
          message={errorMessage}
        />
      </>
    )
  }

  if (showRestaurantFormats) {
    return (
      <>
        <RestaurantFormatSelector
          onContinue={handleRestaurantFormatContinue}
          onBack={handleBack}
          restaurantFormats={restaurantFormats}
          isLoading={isLoadingRestaurantFormats}
          isFetching={isFetchingRestaurantFormats}
        />
        <ErrorModal
          isOpen={errorDialogOpen}
          onClose={() => setErrorDialogOpen(false)}
          message={errorMessage}
        />
      </>
    )
  }

  if (isLoading || isFetching) {
    return <LoadingState message="Загрузка ролей..." />
  }

  if (!isLoading && !isFetching && (error || mainRoles.length === 0)) {
    return <LoadingState message={error ? 'Не удалось загрузить роли' : 'Роли не найдены'} />
  }

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
          <SectionHeader
            title="Кто вы?"
            description="Выберите вашу роль в экосистеме"
            className="mb-8"
          />

          <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
            {mainRoles.map((role: RoleOption, index: number) => (
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
      </div>

      <ErrorModal
        isOpen={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        message={errorMessage}
      />
    </>
  )
}
