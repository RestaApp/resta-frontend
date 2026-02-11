/**
 * Хук для логики отправки подролей (employee, supplier, venue)
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

      const updateData: UpdateUserRequest = {
        user: {
          role: 'employee',
        },
      }

      // Обязательно сохраняем позицию, если она выбрана
      if (selectedPositionValue) {
        updateData.user.position = selectedPositionValue
      }

      // Обязательно сохраняем специализации, если они есть
      if (formData?.specializations && formData.specializations.length > 0) {
        updateData.user.specializations = formData.specializations
      }

      // Опциональные поля - отправляем только если есть значение
      if (formData?.location && formData.location.trim() !== '') {
        updateData.user.city = formData.location.trim()
      }

      // Опциональные поля employee_profile_attributes
      const employeeAttrs: Record<string, unknown> = {}
      if (typeof formData?.experienceYears === 'number' && formData.experienceYears > 0) {
        employeeAttrs.experience_years = formData.experienceYears
      }
      if (typeof formData?.openToWork === 'boolean') {
        employeeAttrs.open_to_work = formData.openToWork
      }
      if (Object.keys(employeeAttrs).length > 0) {
        updateData.user.employee_profile_attributes = employeeAttrs
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
    async (formData?: FormData): Promise<boolean> => {
      if (!formData?.type) {
        return false
      }

      const updateData: UpdateUserRequest = {
        user: {
          role: 'supplier',
        },
      }

      // Создаем объект профиля
      const profileAttributes: Record<string, string> = {
        supplier_type: formData.type,
      }

      // Добавляем название, если есть
      if (formData.name && formData.name.trim() !== '') {
        profileAttributes.name = formData.name.trim()
      }

      updateData.user.supplier_profile_attributes = profileAttributes

      // Добавляем город, если есть
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

      const updateData: UpdateUserRequest = {
        user: {
          role: 'restaurant',
        },
      }

      // Создаем объект профиля
      const profileAttributes: Record<string, string> = {
        restaurant_format: formData.type,
      }

      // Добавляем название, если есть
      if (formData.name && formData.name.trim() !== '') {
        profileAttributes.name = formData.name.trim()
      }

      updateData.user.restaurant_profile_attributes = profileAttributes

      // Добавляем город, если есть
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
