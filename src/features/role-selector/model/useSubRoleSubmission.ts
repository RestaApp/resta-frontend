/**
 * Хук для логики отправки подролей (employee, supplier, restaurant)
 * PATCH /api/v1/users/:id — плоский user, см. ROLES_FRONTEND_SPEC §4
 */

import { useState, useCallback } from 'react'
import { useUserUpdate } from './useUserUpdate'
import type { UpdateUserRequest } from '@/services/api/usersApi'
import type { UiRole, EmployeeRole } from '@/shared/types/roles.types'
import { mapApiRoleToDefaultUiRole } from '@/utils/roles'
import type { EmployeeFormData } from './useEmployeeSubRoleSelector'

export interface SupplierOnboardingData {
  category: string
  types: string[]
}

export interface RestaurantOnboardingData {
  format: string
}

interface UseSubRoleSubmissionProps {
  onSelectRole: (role: UiRole) => void
  onError: (message: string) => void
}

export const useSubRoleSubmission = ({ onSelectRole, onError }: UseSubRoleSubmissionProps) => {
  const [selectedSubRole, setSelectedSubRole] = useState<EmployeeRole | null>(null)
  const [selectedPositionValue, setSelectedPositionValue] = useState<string | null>(null)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { updateUserWithData } = useUserUpdate()

  const handleSubRoleSelect = useCallback((subRole: EmployeeRole, positionValue: string) => {
    setSelectedSubRole(subRole)
    setSelectedPositionValue(positionValue)
  }, [])

  const handleSubRoleContinue = useCallback(
    async (formData?: EmployeeFormData): Promise<boolean> => {
      if (!selectedSubRole) {
        return false
      }

      // Плоский PATCH user — как в ROLES_FRONTEND_SPEC §4 (employee)
      const updateData: UpdateUserRequest = {
        user: {
          role: 'employee',
        },
      }

      if (selectedPositionValue) {
        updateData.user.position = selectedPositionValue
      }

      if (formData?.specializations && formData.specializations.length > 0) {
        updateData.user.specializations = formData.specializations
      }

      const success = await updateUserWithData(
        updateData,
        () => onSelectRole(mapApiRoleToDefaultUiRole('employee') ?? 'chef'),
        error => {
          setErrorMessage(error)
          setErrorDialogOpen(true)
          onError(error)
        }
      )

      return success
    },
    [selectedSubRole, selectedPositionValue, onSelectRole, updateUserWithData, onError]
  )

  const handleSupplierContinue = useCallback(
    async (supplierData?: SupplierOnboardingData): Promise<boolean> => {
      if (!supplierData?.category) {
        return false
      }

      const updateData: UpdateUserRequest = {
        user: {
          role: 'supplier',
          supplier_category: supplierData.category,
          // ROLES_FRONTEND_SPEC: supplier_profile.delivery_available (boolean)
          delivery_available: false,
        },
      }

      if (supplierData.types.length > 0) updateData.user.supplier_types = supplierData.types

      const success = await updateUserWithData(
        updateData,
        () => onSelectRole('supplier'),
        error => {
          setErrorMessage(error)
          setErrorDialogOpen(true)
          onError(error)
        }
      )

      return success
    },
    [onSelectRole, updateUserWithData, onError]
  )

  const handleRestaurantFormatContinue = useCallback(
    async (formData?: RestaurantOnboardingData): Promise<boolean> => {
      if (!formData?.format) {
        return false
      }

      const updateData: UpdateUserRequest = {
        user: {
          role: 'restaurant',
          restaurant_format: formData.format,
          restaurant_profile_attributes: {
            restaurant_format: formData.format,
          },
        },
      }

      const success = await updateUserWithData(
        updateData,
        () => onSelectRole('venue'),
        error => {
          setErrorMessage(error)
          setErrorDialogOpen(true)
          onError(error)
        }
      )

      return success
    },
    [onSelectRole, updateUserWithData, onError]
  )

  const handleCloseError = useCallback(() => {
    setErrorDialogOpen(false)
  }, [])

  const resetSubRoleSelection = useCallback(() => {
    setSelectedSubRole(null)
    setSelectedPositionValue(null)
  }, [])

  return {
    selectedSubRole,
    handleSubRoleSelect,
    handleSubRoleContinue,
    handleSupplierContinue,
    handleRestaurantFormatContinue,
    errorDialogOpen,
    errorMessage,
    handleCloseError,
    resetSubRoleSelection,
  }
}
