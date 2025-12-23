import { RoleCard } from './components/RoleCard'
import { EmployeeSubRoleSelector } from './components/SubRoles/EmployeeSubRoleSelector'
import { SupplierTypeSelector } from './components/SubRoles/SupplierTypeSelector'
import { RestaurantFormatSelector } from './components/SubRoles/RestaurantFormatSelector'
import { SectionHeader } from '../../components/ui/section-header'
import { LoadingState } from './components/SubRoles/components/LoadingState'
import { Modal } from '../../components/ui/modal'
import { ModalContent } from '../../components/ui/modal-content'
import { AlertTriangle } from 'lucide-react'
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
    errorDialogOpen,
    setErrorDialogOpen,
    errorMessage,
  } = useRoleSelector({ onSelectRole })

  if (showEmployeeSubRoles) {
    return (
      <>
        <EmployeeSubRoleSelector
          currentRole={selectedRole}
          onSelectSubRole={handleSubRoleSelect}
          selectedSubRole={selectedSubRole}
          onContinue={handleSubRoleContinue}
          onBack={handleBack}
          employeeSubRoles={employeeSubRoles}
          isLoading={isLoadingPositions}
          isFetching={isFetchingPositions}
          errorDialogOpen={errorDialogOpen}
        />
        <Modal isOpen={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
          <ModalContent
            icon={<AlertTriangle className="w-8 h-8 text-destructive" />}
            title="Ошибка сохранения"
            description={errorMessage || 'Произошла ошибка при сохранении данных'}
            primaryButton={{
              label: 'Понятно',
              onClick: () => setErrorDialogOpen(false),
            }}
          />
        </Modal>
      </>
    )
  }

  if (showSupplierTypes) {
    return (
      <>
        <SupplierTypeSelector
          onSelectType={handleSupplierTypeSelect}
          selectedType={selectedSupplierType}
          onContinue={handleSupplierTypeContinue}
          onBack={handleBack}
          supplierTypes={supplierTypes}
          isLoading={isLoadingSupplierTypes}
          isFetching={isFetchingSupplierTypes}
        />
        <Modal isOpen={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
          <ModalContent
            icon={<AlertTriangle className="w-8 h-8 text-destructive" />}
            title="Ошибка сохранения"
            description={errorMessage || 'Произошла ошибка при сохранении данных'}
            primaryButton={{
              label: 'Понятно',
              onClick: () => setErrorDialogOpen(false),
            }}
          />
        </Modal>
      </>
    )
  }

  if (showRestaurantFormats) {
    return (
      <>
        <RestaurantFormatSelector
          onSelectFormat={handleRestaurantFormatSelect}
          selectedFormat={selectedRestaurantFormat}
          onContinue={handleRestaurantFormatContinue}
          onBack={handleBack}
          restaurantFormats={restaurantFormats}
          isLoading={isLoadingRestaurantFormats}
          isFetching={isFetchingRestaurantFormats}
        />
        <Modal isOpen={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
          <ModalContent
            icon={<AlertTriangle className="w-8 h-8 text-destructive" />}
            title="Ошибка сохранения"
            description={errorMessage || 'Произошла ошибка при сохранении данных'}
            primaryButton={{
              label: 'Понятно',
              onClick: () => setErrorDialogOpen(false),
            }}
          />
        </Modal>
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

      <Modal isOpen={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <ModalContent
          icon={<AlertTriangle className="w-8 h-8 text-destructive" />}
          title="Ошибка сохранения"
          description={errorMessage || 'Произошла ошибка при сохранении данных'}
          primaryButton={{
            label: 'Понятно',
            onClick: () => setErrorDialogOpen(false),
          }}
        />
      </Modal>
    </>
  )
}
