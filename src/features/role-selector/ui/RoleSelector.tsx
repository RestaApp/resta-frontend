import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { RoleCard } from './components/RoleCard'
import { ErrorModal } from './components/subroles/shared/ErrorModal'
import { cn } from '@/utils/cn'

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
      <div className="bg-background flex min-h-[100dvh] flex-col">
        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-6">
          <div className="mx-auto w-full max-w-md">
            <p className="mb-4 text-xs font-medium tracking-[0.24em] text-[#7F7770] uppercase">
              {t('roles.mainStep', { current: 1, total: 2 })}
            </p>
            <div className="mb-10 h-1.5 w-full rounded-full bg-[#241f1a]">
              <div className="h-full w-1/2 rounded-full bg-[#F05A28]" />
            </div>

            <h1 className="text-[clamp(2.8rem,11vw,4.1rem)] leading-[0.96] font-semibold text-[#F2ECE4]">
              {t('roles.whoAreYou')}
            </h1>
            <p className="mt-4 text-[clamp(1.45rem,5.6vw,2.2rem)] leading-[1.15] text-[#8A8178]">
              {t('roles.roleChoiceHint')}
            </p>

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

        <div className="border-t border-[#2A241F] bg-background px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="mx-auto w-full max-w-md">
            <button
              type="button"
              onClick={vm.handleRoleContinue}
              disabled={!vm.selectedRole}
              className={cn(
                'h-16 w-full rounded-[2rem] text-[clamp(1.35rem,4.9vw,2.1rem)] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-100',
                vm.selectedRole ? 'bg-[#F05A28] text-[#FFF4EA]' : 'bg-[#8B3B20] text-[#9B938D]'
              )}
            >
              {t('common.selectRole')}
            </button>
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
