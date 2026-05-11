import { useCallback, useMemo } from 'react'
import { useRoleSelection } from './useRoleSelection'
import { useSubRoleSubmission } from './useSubRoleSubmission'
import { logger } from '@/utils/logger'
import type { UiRole } from '@/shared/types/roles.types'

type RoleSelectorFlow =
  | 'main'
  | 'telegram_confirm'
  | 'employee'
  | 'supplier_category'
  | 'restaurant'

interface UseRoleSelectorProps {
  onSelectRole: (role: UiRole) => void
}

export const useRoleSelector = ({ onSelectRole }: UseRoleSelectorProps) => {
  const roleSelection = useRoleSelection({ onSelectRole })
  const subRoleSubmission = useSubRoleSubmission({
    onSelectRole,
    onError: useCallback((message: string) => {
      logger.error('Ошибка при сохранении подроли:', message)
    }, []),
  })

  const flow: RoleSelectorFlow = useMemo(() => {
    if (roleSelection.showTelegramConfirm) return 'telegram_confirm'
    if (roleSelection.showEmployeeSubRoles) return 'employee'
    if (roleSelection.showSupplierCategory) return 'supplier_category'
    if (roleSelection.showRestaurantFormats) return 'restaurant'
    return 'main'
  }, [
    roleSelection.showTelegramConfirm,
    roleSelection.showEmployeeSubRoles,
    roleSelection.showSupplierCategory,
    roleSelection.showRestaurantFormats,
  ])

  const handleBack = useCallback(() => {
    roleSelection.handleBack()
    subRoleSubmission.resetSubRoleSelection()
  }, [roleSelection, subRoleSubmission])

  const handleSupplierCategoryContinue = useCallback(
    async (category: string, supplierTypes: string[]) => {
      return subRoleSubmission.handleSupplierContinue({ category, types: supplierTypes })
    },
    [subRoleSubmission]
  )

  return {
    flow,

    selectedRole: roleSelection.selectedRole,
    mainRoles: roleSelection.mainRoles,
    isLoading: roleSelection.isLoading,
    isFetching: roleSelection.isFetching,
    error: roleSelection.error,

    employeeSubRoles: roleSelection.employeeSubRoles,
    isLoadingPositions: roleSelection.isLoadingPositions,
    isFetchingPositions: roleSelection.isFetchingPositions,

    supplierCategories: roleSelection.supplierCategories,
    isLoadingSupplierCategories: roleSelection.isLoadingSupplierCategories,
    isFetchingSupplierCategories: roleSelection.isFetchingSupplierCategories,

    restaurantFormats: roleSelection.restaurantFormats,
    isLoadingRestaurantFormats: roleSelection.isLoadingRestaurantFormats,
    isFetchingRestaurantFormats: roleSelection.isFetchingRestaurantFormats,

    selectedSubRole: subRoleSubmission.selectedSubRole,

    handleRoleSelect: roleSelection.handleRoleSelect,
    handleRoleContinue: roleSelection.handleRoleContinue,
    handleTelegramContinue: roleSelection.handleTelegramContinue,
    handleSubRoleSelect: subRoleSubmission.handleSubRoleSelect,
    handleSubRoleContinue: subRoleSubmission.handleSubRoleContinue,
    handleSupplierCategoryContinue,
    handleRestaurantFormatContinue: subRoleSubmission.handleRestaurantFormatContinue,

    handleBack,

    errorDialogOpen: subRoleSubmission.errorDialogOpen,
    errorMessage: subRoleSubmission.errorMessage,
    closeErrorDialog: subRoleSubmission.handleCloseError,
  }
}
