/**
 * Хук для логики страницы выбора роли
 * Композирует useRoleSelection и useSubRoleSubmission
 */

import { useCallback } from 'react'
import { useRoleSelection } from './useRoleSelection'
import { useSubRoleSubmission } from './useSubRoleSubmission'
import type { UserRole } from '@/types'

interface UseRoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export const useRoleSelector = ({ onSelectRole }: UseRoleSelectorProps) => {
  const roleSelection = useRoleSelection({ onSelectRole })
  const subRoleSubmission = useSubRoleSubmission({
    onSelectRole,
    onError: useCallback((message: string) => {
      // Обработка ошибок уже происходит в useSubRoleSubmission
      console.error('Ошибка при сохранении подроли:', message)
    }, []),
  })

  const handleBack = useCallback(() => {
    roleSelection.handleBack()
    // Сбрасываем выбор подроли при возврате
    if (roleSelection.showEmployeeSubRoles) {
      subRoleSubmission.resetSubRoleSelection()
    }
  }, [roleSelection, subRoleSubmission])

  return {
    selectedRole: roleSelection.selectedRole,
    showEmployeeSubRoles: roleSelection.showEmployeeSubRoles,
    showSupplierTypes: roleSelection.showSupplierTypes,
    showRestaurantFormats: roleSelection.showRestaurantFormats,
    selectedSubRole: subRoleSubmission.selectedSubRole,
    mainRoles: roleSelection.mainRoles,
    isLoading: roleSelection.isLoading,
    isFetching: roleSelection.isFetching,
    error: roleSelection.error,
    employeeSubRoles: roleSelection.employeeSubRoles,
    isLoadingPositions: roleSelection.isLoadingPositions,
    isFetchingPositions: roleSelection.isFetchingPositions,
    supplierTypes: roleSelection.supplierTypes,
    isLoadingSupplierTypes: roleSelection.isLoadingSupplierTypes,
    isFetchingSupplierTypes: roleSelection.isFetchingSupplierTypes,
    restaurantFormats: roleSelection.restaurantFormats,
    isLoadingRestaurantFormats: roleSelection.isLoadingRestaurantFormats,
    isFetchingRestaurantFormats: roleSelection.isFetchingRestaurantFormats,
    handleRoleSelect: roleSelection.handleRoleSelect,
    handleSubRoleSelect: subRoleSubmission.handleSubRoleSelect,
    handleSubRoleContinue: subRoleSubmission.handleSubRoleContinue,
    handleSupplierTypeContinue: subRoleSubmission.handleSupplierTypeContinue,
    handleRestaurantFormatContinue: subRoleSubmission.handleRestaurantFormatContinue,
    handleBack,
    errorDialogOpen: subRoleSubmission.errorDialogOpen,
    setErrorDialogOpen: subRoleSubmission.handleCloseError,
    errorMessage: subRoleSubmission.errorMessage,
  }
}
