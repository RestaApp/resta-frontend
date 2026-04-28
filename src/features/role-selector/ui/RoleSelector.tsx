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
import { LoadingPage } from '@/pages/applications/components/Loading/LoadingPage'
import { TelegramConfirmStep } from './components/TelegramConfirmStep'
import { Button } from '@/components/ui/button'

import { useRoleSelector } from '../model/useRoleSelector'
import type { UiRole } from '@/shared/types/roles.types'

interface RoleSelectorProps {
  onSelectRole: (role: UiRole) => void
}

export const RoleSelector = memo(function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const { t } = useTranslation()
  const vm = useRoleSelector({ onSelectRole })
  const selectedRole = vm.mainRoles.find(role => role.id === vm.selectedRole)

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
      />
    )
  }

  if (vm.flow === 'telegram_confirm') {
    return <TelegramConfirmStep onContinue={vm.handleTelegramContinue} />
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
  if (vm.isLoading && vm.mainRoles.length === 0) return <LoadingPage />
  if (vm.error) return <LoadingState message={t('roles.loadRolesError')} />
  if (vm.mainRoles.length === 0) return <LoadingState message={t('roles.noRoles')} />

  return (
    <>
      <div className="bg-background flex flex-col min-h-[100dvh]">
        <div className="flex-1 flex flex-col ui-density-page ui-density-py pt-[14px] overflow-y-auto">
          <OnboardingProgress current={1} total={3} className="mb-[14px]" />
          <SectionHeader
            title={t('roles.whoAreYou')}
            description={t('roles.roleChoiceHint')}
            className="mb-4 w-[280px]"
            titleClassName="max-w-[280px] text-[36px] leading-[1.05] tracking-[-0.025em] mb-2"
            descriptionClassName="max-w-[280px] text-sm leading-[1.4] text-muted-foreground"
          />

          <div
            className={`flex flex-col gap-2.5 ${
              vm.selectedRole
                ? 'pb-[calc(6rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))]'
                : 'pb-4'
            }`}
          >
            {vm.mainRoles.map((role, index) => (
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
      {vm.selectedRole ? (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 px-4 pt-3 pb-[calc(1.25rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))] backdrop-blur-sm">
          <Button
            type="button"
            onClick={vm.handleRoleContinue}
            variant="gradient"
            size="lg"
            className="mx-auto w-full max-w-md"
            aria-label={t('roles.continueAsRole', { role: selectedRole?.title ?? '' })}
          >
            {t('roles.continueAsRole', { role: selectedRole?.title ?? '' })}
          </Button>
        </div>
      ) : null}

      <ErrorModal
        isOpen={vm.errorDialogOpen}
        onClose={vm.closeErrorDialog}
        message={vm.errorMessage}
      />
    </>
  )
})
