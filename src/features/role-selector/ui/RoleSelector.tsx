import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionHeader } from '@/components/ui'
import { RoleCard } from './components/RoleCard'
import { OnboardingProgress } from './components/OnboardingProgress'
import { ErrorModal } from './components/subroles/shared/ErrorModal'

import { EmployeeSubRoleSelector } from './components/subroles/EmployeeSubRoleSelector'
import { SupplierTypeSelector } from './components/subroles/SupplierTypeSelector'
import { RestaurantFormatSelector } from './components/subroles/RestaurantFormatSelector'
import { LoadingState } from './components/subroles/shared/LoadingState'

import { useRoleSelector } from '../model/useRoleSelector'
import type { UiRole, RoleOption } from '@/shared/types/roles.types'

interface RoleSelectorProps {
  onSelectRole: (role: UiRole) => void
}

export const RoleSelector = memo(function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const { t } = useTranslation()
  const vm = useRoleSelector({ onSelectRole })

  // Sub-flows
  if (vm.flow === 'employee') {
    return (
      <EmployeeSubRoleSelector
        onSelectSubRole={vm.handleSubRoleSelect}
        selectedSubRole={vm.selectedSubRole}
        onContinue={vm.handleSubRoleContinue}
        onBack={vm.handleBack}
        employeeSubRoles={vm.employeeSubRoles}
        isLoading={vm.isLoadingPositions}
        isFetching={vm.isFetchingPositions}
        errorDialogOpen={vm.errorDialogOpen}
      />
    )
  }

  if (vm.flow === 'supplier') {
    return (
      <SupplierTypeSelector
        onContinue={vm.handleSupplierTypeContinue}
        onBack={vm.handleBack}
        supplierTypes={vm.supplierTypes}
        isLoading={vm.isLoadingSupplierTypes}
        isFetching={vm.isFetchingSupplierTypes}
      />
    )
  }

  if (vm.flow === 'restaurant') {
    return (
      <RestaurantFormatSelector
        onContinue={vm.handleRestaurantFormatContinue}
        onBack={vm.handleBack}
        restaurantFormats={vm.restaurantFormats}
        isLoading={vm.isLoadingRestaurantFormats}
        isFetching={vm.isFetchingRestaurantFormats}
      />
    )
  }

  // Loading / Error / Empty
  if (vm.isLoading || vm.isFetching) return <LoadingState />
  if (vm.error) return <LoadingState message={t('roles.loadRolesError')} />
  if (vm.mainRoles.length === 0) return <LoadingState message={t('roles.noRoles')} />

  return (
    <>
      <div className=" bg-background flex flex-col">
        <div className="flex-1 flex flex-col px-6 py-6 overflow-y-auto">
          <OnboardingProgress current={1} total={3} className="mb-6" />
          <SectionHeader
            title={t('roles.whoAreYou')}
            description={t('roles.chooseRole')}
            hint={t('roles.roleChoiceHint')}
            className="mb-6"
          />

          <div className="flex-1 flex flex-col gap-3 max-w-md mx-auto w-full">
            {vm.mainRoles.map((role: RoleOption, index: number) => (
              <RoleCard
                key={role.id}
                role={role}
                isSelected={vm.selectedRole === role.id}
                index={index}
                onSelect={vm.handleRoleSelect}
                showPopularBadge={role.id === 'chef'}
              />
            ))}
          </div>
        </div>
      </div>

      <ErrorModal
        isOpen={vm.errorDialogOpen}
        onClose={vm.closeErrorDialog}
        message={vm.errorMessage}
      />
    </>
  )
})
