import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionHeader } from '@/components/ui'
import { OnboardingProgress } from './components/OnboardingProgress'
import { RoleCard } from './components/RoleCard'
import { ErrorModal } from './components/subroles/shared/ErrorModal'

import { EmployeeSubRoleSelector } from './components/subroles/EmployeeSubRoleSelector'
import { SupplierCategorySelector } from './components/subroles/SupplierCategorySelector'
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

  // Sub-flows — early returns AFTER all hooks
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

  if (vm.flow === 'supplier_category') {
    return (
      <SupplierCategorySelector
        categories={vm.supplierCategories}
        onContinue={vm.handleSupplierCategoryContinue}
        onBack={vm.handleBack}
        isLoading={vm.isLoadingSupplierCategories}
        isFetching={vm.isFetchingSupplierCategories}
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
      <div className="bg-background flex flex-col min-h-[100dvh]">
        <div className="flex-1 flex flex-col ui-density-page ui-density-py overflow-y-auto pb-[calc(5.5rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))]">
          <OnboardingProgress current={1} total={2} className="ui-density-mb-lg" />
          <SectionHeader
            title={t('roles.whoAreYou')}
            description={t('roles.roleChoiceHint')}
            className="ui-density-mb-lg w-70"
          />

          <div className="mt-10 flex flex-col gap-5">
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
