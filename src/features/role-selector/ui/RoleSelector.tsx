import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { OnboardingStepLayout } from './components/OnboardingStepLayout'
import { RoleCard } from './components/RoleCard'
import { ErrorModal } from '@/components/ui/error-modal'

import { EmployeeSubRoleSelector } from './components/subroles/EmployeeSubRoleSelector'
import { SupplierCategorySelector } from './components/subroles/SupplierCategorySelector'
import { RestaurantFormatSelector } from './components/subroles/RestaurantFormatSelector'
import { LoadingState } from './components/subroles/shared/LoadingState'
import { LoadingPage } from '@/pages/applications/components/Loading/LoadingPage'
import { TelegramConfirmStep } from './components/TelegramConfirmStep'
import { OnboardingBottomCta, ONBOARDING_BOTTOM_CTA_SPACE } from './components/OnboardingBottomCta'

import { useRoleSelector } from '../model/useRoleSelector'
import { useSwipeBack } from '../model/useSwipeBack'
import type { UiRole } from '@/shared/types/roles.types'

interface RoleSelectorProps {
  onSelectRole: (role: UiRole) => void
}

export const RoleSelector = memo(function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const { t } = useTranslation()
  const vm = useRoleSelector({ onSelectRole })
  const canSwipeBack = vm.flow !== 'main' || vm.selectedRole !== null
  useSwipeBack({ enabled: canSwipeBack, onBack: vm.handleBack })

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
      <OnboardingStepLayout
        currentStep={1}
        totalSteps={3}
        title={t('roles.whoAreYou')}
        subtitle={t('roles.roleChoiceHint')}
        bottomSpace={vm.selectedRole ? ONBOARDING_BOTTOM_CTA_SPACE : undefined}
      >
        <div className="flex flex-col gap-4">
          {vm.mainRoles.map(role => (
            <RoleCard
              key={role.id}
              role={role}
              isSelected={vm.selectedRole === role.id}
              onSelect={vm.handleRoleSelect}
            />
          ))}
        </div>
      </OnboardingStepLayout>
      {vm.selectedRole ? (
        <OnboardingBottomCta onClick={vm.handleRoleContinue} ariaLabel={t('common.continue')}>
          {t('common.continue')}
        </OnboardingBottomCta>
      ) : null}

      <ErrorModal
        isOpen={vm.errorDialogOpen}
        onClose={vm.closeErrorDialog}
        message={vm.errorMessage}
      />
    </>
  )
})
