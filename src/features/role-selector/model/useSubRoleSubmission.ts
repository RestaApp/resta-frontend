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
import type { FormData } from './useFormSelector'

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

      if (formData?.location && formData.location.trim() !== '') {
        updateData.user.city = formData.location.trim()
      }

      if (typeof formData?.experienceYears === 'number' && formData.experienceYears > 0) {
        updateData.user.experience_years = formData.experienceYears
      }
      if (typeof formData?.openToWork === 'boolean') {
        updateData.user.open_to_work = formData.openToWork
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

  const handleSupplierTypeContinue = useCallback(
    async (formData?: FormData, supplierCategory?: string): Promise<boolean> => {
      if (!formData || !supplierCategory) {
        return false
      }

      const selectedSupplierTypes =
        formData.types.length > 0 ? formData.types : formData.type ? [formData.type] : []

      if (selectedSupplierTypes.length === 0) {
        return false
      }

      const updateData: UpdateUserRequest = {
        user: {
          role: 'supplier',
          supplier_category: supplierCategory,
          supplier_types: selectedSupplierTypes,
          // ROLES_FRONTEND_SPEC: supplier_profile.delivery_available (boolean)
          delivery_available: false,
        },
      }

      if (formData.name && formData.name.trim() !== '') {
        updateData.user.name = formData.name.trim()
      }

      if (formData.city && formData.city.trim() !== '') {
        updateData.user.city = formData.city.trim()
      }

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
    async (formData?: FormData): Promise<boolean> => {
      if (!formData?.type) {
        return false
      }

      const trimmedName = formData.name.trim()

      // Плоский PATCH + вложенный профиль: название заведения хранится в restaurant_profile (не в Telegram name)
      const updateData: UpdateUserRequest = {
        user: {
          role: 'restaurant',
          restaurant_format: formData.type,
          restaurant_profile_attributes: {
            restaurant_format: formData.type,
          },
        },
      }

      if (trimmedName) {
        updateData.user.name = trimmedName
      }

      if (formData.city && formData.city.trim() !== '') {
        updateData.user.city = formData.city.trim()
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
    handleSupplierTypeContinue,
    handleRestaurantFormatContinue,
    errorDialogOpen,
    errorMessage,
    handleCloseError,
    resetSubRoleSelection,
  }
}
