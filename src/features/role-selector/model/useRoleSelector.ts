import { useCallback, useMemo } from 'react'
import { useRoleSelection } from './useRoleSelection'
import { useSubRoleSubmission } from './useSubRoleSubmission'
import { logger } from '@/shared/lib/logger'
import type { UiRole } from '@/shared/types/roles.types'

type RoleSelectorFlow = 'main' | 'employee' | 'supplier' | 'restaurant'

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
    if (roleSelection.showEmployeeSubRoles) return 'employee'
    if (roleSelection.showSupplierTypes) return 'supplier'
    if (roleSelection.showRestaurantFormats) return 'restaurant'
    return 'main'
  }, [roleSelection.showEmployeeSubRoles, roleSelection.showSupplierTypes, roleSelection.showRestaurantFormats])

  const handleBack = useCallback(() => {
    roleSelection.handleBack()
    subRoleSubmission.resetSubRoleSelection() // reset всегда при back из subflow
  }, [roleSelection, subRoleSubmission])

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

    supplierTypes: roleSelection.supplierTypes,
    isLoadingSupplierTypes: roleSelection.isLoadingSupplierTypes,
    isFetchingSupplierTypes: roleSelection.isFetchingSupplierTypes,

    restaurantFormats: roleSelection.restaurantFormats,
    isLoadingRestaurantFormats: roleSelection.isLoadingRestaurantFormats,
    isFetchingRestaurantFormats: roleSelection.isFetchingRestaurantFormats,

    selectedSubRole: subRoleSubmission.selectedSubRole,

    handleRoleSelect: roleSelection.handleRoleSelect,
    handleSubRoleSelect: subRoleSubmission.handleSubRoleSelect,
    handleSubRoleContinue: subRoleSubmission.handleSubRoleContinue,
    handleSupplierTypeContinue: subRoleSubmission.handleSupplierTypeContinue,
    handleRestaurantFormatContinue: subRoleSubmission.handleRestaurantFormatContinue,

    handleBack,

    errorDialogOpen: subRoleSubmission.errorDialogOpen,
    errorMessage: subRoleSubmission.errorMessage,
    closeErrorDialog: subRoleSubmission.handleCloseError,
  }
}
