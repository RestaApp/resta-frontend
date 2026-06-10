/**
 * Хук для логики отправки подролей (employee, supplier, restaurant)
 * PATCH /api/v1/users/:id — единая схема user + профильные атрибуты роли.
 */

import { useState, useCallback } from 'react'
import { useUserUpdate } from './useUserUpdate'
import type { UiRole, EmployeeRole } from '@/shared/types/roles.types'
import type { EmployeeFormData } from './useEmployeeSubRoleSelector'
import { buildRegistrationUpdateUserRequest } from '@/shared/utils/buildRegistrationRequest'
import { triggerHapticFeedback } from '@/shared/utils/haptics'

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
  const [completedRole, setCompletedRole] = useState<UiRole | null>(null)
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

      const updateData = buildRegistrationUpdateUserRequest({
        role: 'employee',
        position: selectedPositionValue,
        specializations: formData?.specializations,
      })

      const success = await updateUserWithData(
        updateData,
        () => {
          triggerHapticFeedback('success')
          setCompletedRole(selectedSubRole)
        },
        error => {
          triggerHapticFeedback('error')
          setErrorMessage(error)
          setErrorDialogOpen(true)
          onError(error)
        }
      )

      return success
    },
    [selectedSubRole, selectedPositionValue, updateUserWithData, onError]
  )

  const handleSupplierContinue = useCallback(
    async (supplierData?: SupplierOnboardingData): Promise<boolean> => {
      if (!supplierData?.category) {
        return false
      }

      const updateData = buildRegistrationUpdateUserRequest({
        role: 'supplier',
        supplierCategory: supplierData.category,
        supplierTypes: supplierData.types,
      })

      const success = await updateUserWithData(
        updateData,
        () => {
          triggerHapticFeedback('success')
          setCompletedRole('supplier')
        },
        error => {
          triggerHapticFeedback('error')
          setErrorMessage(error)
          setErrorDialogOpen(true)
          onError(error)
        }
      )

      return success
    },
    [updateUserWithData, onError]
  )

  const handleRestaurantFormatContinue = useCallback(
    async (formData?: RestaurantOnboardingData): Promise<boolean> => {
      if (!formData?.format) {
        return false
      }

      const updateData = buildRegistrationUpdateUserRequest({
        role: 'restaurant',
        restaurantFormat: formData.format,
      })

      const success = await updateUserWithData(
        updateData,
        () => {
          triggerHapticFeedback('success')
          setCompletedRole('venue')
        },
        error => {
          triggerHapticFeedback('error')
          setErrorMessage(error)
          setErrorDialogOpen(true)
          onError(error)
        }
      )

      return success
    },
    [updateUserWithData, onError]
  )

  const handleCloseError = useCallback(() => {
    setErrorDialogOpen(false)
  }, [])

  const resetSubRoleSelection = useCallback(() => {
    setSelectedSubRole(null)
    setSelectedPositionValue(null)
  }, [])

  const handleRegistrationComplete = useCallback(() => {
    if (!completedRole) return
    onSelectRole(completedRole)
    setCompletedRole(null)
  }, [completedRole, onSelectRole])

  return {
    selectedSubRole,
    handleSubRoleSelect,
    handleSubRoleContinue,
    handleSupplierContinue,
    handleRestaurantFormatContinue,
    completedRole,
    handleRegistrationComplete,
    errorDialogOpen,
    errorMessage,
    handleCloseError,
    resetSubRoleSelection,
  }
}
