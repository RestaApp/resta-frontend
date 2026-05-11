import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { OnboardingProgress } from './components/OnboardingProgress'
import { RoleCard } from './components/RoleCard'
import { ErrorModal } from './components/subroles/shared/ErrorModal'

import { EmployeeSubRoleSelector } from './components/subroles/EmployeeSubRoleSelector'
import { SupplierCategorySelector } from './components/subroles/SupplierCategorySelector'
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
    return (
      <TelegramConfirmStep
        selectedRole={vm.selectedRole}
        onContinue={vm.handleTelegramContinue}
        onBack={vm.handleBack}
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
        <div
          className={`flex-1 flex flex-col ui-density-page ui-density-py pt-[14px] ${
            vm.selectedRole ? 'overflow-y-auto' : 'overflow-y-hidden'
          }`}
        >
          <OnboardingProgress current={1} total={3} className="mb-[14px]" />
          <div className="mb-4 w-[280px]">
            <h1 className="max-w-[280px] font-sans font-extrabold text-display leading-[1.15] tracking-[-0.025em] mb-1.5 text-foreground">
              {t('roles.whoAreYou')}
            </h1>
            <p className="max-w-[280px] text-meta leading-snug text-muted-foreground">
              {t('roles.roleChoiceHint')}
            </p>
          </div>

          <div
            className={`flex flex-col gap-2.5 ${
              vm.selectedRole
                ? 'pb-[calc(6rem+var(--tg-safe-area-inset-bottom,env(safe-area-inset-bottom)))]'
                : 'pb-0'
            }`}
          >
            {vm.mainRoles.map((role, index) => (
              <RoleCard
                key={role.id}
                role={role}
                isSelected={vm.selectedRole === role.id}
                index={index}
                onSelect={vm.handleRoleSelect}
              />
            ))}
          </div>
        </div>
      </div>
      {vm.selectedRole ? (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 px-4 pt-3 pb-safe-cta backdrop-blur-sm">
          <div className="mx-auto w-full max-w-md">
            <Button
              type="button"
              onClick={vm.handleRoleContinue}
              variant="gradient"
              size="lg"
              className="w-full"
              aria-label={t('common.continue')}
            >
              {t('common.continue')} →
            </Button>
          </div>
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
