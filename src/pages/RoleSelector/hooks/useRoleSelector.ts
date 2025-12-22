/**
 * Хук для логики страницы выбора роли
 */

import { useState, useCallback, useMemo } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useAppSelector } from '../../../store/hooks'
import { useRoles } from '../../../hooks/useRoles'
import { useUpdateUser } from '../../../hooks/useUsers'
import { useUserPositions } from '../../../hooks/useUserPositions'
import { useSupplierTypes } from '../../../hooks/useSupplierTypes'
import { useRestaurantFormats } from '../../../hooks/useRestaurantFormats'
import { mapRoleOptionsFromApi } from '../../../utils/rolesMapper'
import { mapRoleFromApi } from '../../../utils/roles'
import { getCurrentUserId } from '../../../utils/user'
import type { UpdateUserRequest } from '../../../services/api/usersApi'
import type { UserRole, EmployeeRole } from '../../../types'

interface UseRoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export function useRoleSelector({ onSelectRole }: UseRoleSelectorProps) {
  // draftSelectedRole — локальный выбор до подтверждения / отправки на сервер
  const [draftSelectedRole, setDraftSelectedRole] = useState<UserRole | null>(null)
  const [showEmployeeSubRoles, setShowEmployeeSubRoles] = useState(false)
  const [showSupplierTypes, setShowSupplierTypes] = useState(false)
  const [showRestaurantFormats, setShowRestaurantFormats] = useState(false)
  const [selectedSubRole, setSelectedSubRole] = useState<EmployeeRole | null>(null)
  const [selectedPositionValue, setSelectedPositionValue] = useState<string | null>(null)
  const [selectedSupplierType, setSelectedSupplierType] = useState<string | null>(null)
  const [selectedRestaurantFormat, setSelectedRestaurantFormat] = useState<string | null>(null)

  const { isAuthenticated } = useAuth()
  const userData = useAppSelector(state => state.user.userData)
  const { updateUser } = useUpdateUser()

  // Проверяем, что роль пользователя равна 'unverified'
  // roles API вызывается ТОЛЬКО если роль в sign_in равна 'unverified'
  const isUnverifiedRole = useMemo(() => {
    if (!userData?.role) {
      return false
    }
    const normalizedRole = userData.role.toLowerCase().trim()
    return normalizedRole === 'unverified'
  }, [userData?.role])

  // Запрашиваем роли только если пользователь авторизован И его роль равна 'unverified'
  const { roles, isLoading, isFetching, error } = useRoles({ skip: !isUnverifiedRole })

  // Загружаем позиции только если выбрана роль employee (chef) И роль пользователя unverified
  const shouldLoadPositions =
    (draftSelectedRole === 'chef' || showEmployeeSubRoles) && isUnverifiedRole

  const {
    positionsApi: employeeSubRoles,
    isLoading: isLoadingPositions,
    isFetching: isFetchingPositions,
  } = useUserPositions({ enabled: shouldLoadPositions })

  // Загружаем типы поставщиков только если выбрана роль supplier И роль пользователя unverified
  const shouldLoadSupplierTypes =
    (draftSelectedRole === 'supplier' || showSupplierTypes) && isUnverifiedRole

  const {
    supplierTypes,
    isLoading: isLoadingSupplierTypes,
    isFetching: isFetchingSupplierTypes,
  } = useSupplierTypes({ enabled: shouldLoadSupplierTypes })

  // Загружаем форматы ресторанов только если выбрана роль venue И роль пользователя unverified
  const shouldLoadRestaurantFormats =
    (draftSelectedRole === 'venue' || showRestaurantFormats) && isUnverifiedRole

  const {
    restaurantFormats,
    isLoading: isLoadingRestaurantFormats,
    isFetching: isFetchingRestaurantFormats,
  } = useRestaurantFormats({ enabled: shouldLoadRestaurantFormats })

  // Преобразуем данные из API в формат компонентов
  const mainRoles = useMemo(() => {
    if (roles.length === 0) {
      return []
    }
    return mapRoleOptionsFromApi(roles)
  }, [roles])

  // Получаем текущую роль пользователя из userData
  const currentUserRole = useMemo(() => {
    if (!userData?.role) {
      return null
    }
    return mapRoleFromApi(userData.role)
  }, [userData])

  const handleRoleSelect = useCallback(
    async (roleId: UserRole) => {
      setDraftSelectedRole(roleId)
      // Если выбрали сотрудника, показываем экран подролей
      if (roleId === 'chef') {
        setShowEmployeeSubRoles(true)
        return
      }

      // Если выбрали поставщика, показываем экран типов поставщиков
      if (roleId === 'supplier') {
        setShowSupplierTypes(true)
        return
      }

      // Если выбрали заведение, показываем экран форматов ресторанов
      if (roleId === 'venue') {
        setShowRestaurantFormats(true)
        return
      }

      // Для остальных ролей отправляем на сервер через PATCH /api/v1/users/:id
      if (!isAuthenticated) {
        onSelectRole(roleId)
        return
      }

      // Получаем userId через утилиту
      const userId = await getCurrentUserId()
      if (!userId) {
        onSelectRole(roleId)
        return
      }

      try {
        const updateData: UpdateUserRequest = {
          user: {
            role: roleId,
          },
        }

        await updateUser(userId, updateData)
        onSelectRole(roleId)
      } catch (error) {
        // В случае ошибки все равно выбираем роль локально
        onSelectRole(roleId)
      }
    },
    [onSelectRole, updateUser, isAuthenticated]
  )

  const handleContinue = useCallback(async () => {
    if (!draftSelectedRole) {
      return
    }

    if (draftSelectedRole === 'chef') {
      setShowEmployeeSubRoles(true)
      return
    }

    if (draftSelectedRole === 'supplier') {
      setShowSupplierTypes(true)
      return
    }

    if (draftSelectedRole === 'venue') {
      setShowRestaurantFormats(true)
      return
    }

    if (!isAuthenticated) {
      onSelectRole(draftSelectedRole)
      return
    }

    const userId = await getCurrentUserId()
    if (!userId) {
      onSelectRole(draftSelectedRole)
      return
    }

    try {
      const updateData: UpdateUserRequest = {
        user: {
          role: draftSelectedRole,
        },
      }

      await updateUser(userId, updateData)
      onSelectRole(draftSelectedRole)
    } catch (error) {
      onSelectRole(draftSelectedRole)
    }
  }, [draftSelectedRole, onSelectRole, updateUser, isAuthenticated])

  const handleSubRoleSelect = useCallback((subRole: EmployeeRole, positionValue: string) => {
    setSelectedSubRole(subRole)
    setSelectedPositionValue(positionValue)
  }, [])

  const handleSubRoleContinue = useCallback(async () => {
    if (!selectedSubRole) {
      return
    }

    if (!isAuthenticated) {
      onSelectRole(selectedSubRole)
      return
    }

    const userId = await getCurrentUserId()
    if (!userId) {
      onSelectRole(selectedSubRole)
      return
    }

    try {
      const updateData: UpdateUserRequest = {
        user: selectedPositionValue
          ? {
              role: 'employee',
              position: selectedPositionValue,
            }
          : {
              role: 'employee',
            },
      }

      if (!updateUser) {
        throw new Error('updateUser функция не определена')
      }

      await updateUser(userId, updateData)
      onSelectRole(selectedSubRole)
    } catch (error) {
      onSelectRole(selectedSubRole)
    }
  }, [selectedSubRole, selectedPositionValue, onSelectRole, updateUser, isAuthenticated])

  const handleSupplierTypeSelect = useCallback((typeValue: string) => {
    setSelectedSupplierType(typeValue)
  }, [])

  const handleRestaurantFormatSelect = useCallback((formatValue: string) => {
    setSelectedRestaurantFormat(formatValue)
  }, [])

  const handleSupplierTypeContinue = useCallback(async () => {
    if (!selectedSupplierType) {
      return
    }

    if (!isAuthenticated) {
      onSelectRole('supplier')
      return
    }

    const userId = await getCurrentUserId()
    if (!userId) {
      onSelectRole('supplier')
      return
    }

    try {
      const updateData: UpdateUserRequest = {
        user: selectedSupplierType
          ? {
              role: 'supplier',
              supplier_profile_attributes: { supplier_type: selectedSupplierType },
            }
          : {
              role: 'supplier',
            },
      }

      if (!updateUser) {
        throw new Error('updateUser функция не определена')
      }

      await updateUser(userId, updateData)
      onSelectRole('supplier')
    } catch (error) {
      onSelectRole('supplier')
    }
  }, [selectedSupplierType, onSelectRole, updateUser, isAuthenticated, userData])

  const handleRestaurantFormatContinue = useCallback(async () => {
    if (!selectedRestaurantFormat) {
      return
    }

    if (!isAuthenticated) {
      onSelectRole('venue')
      return
    }

    const userId = await getCurrentUserId()
    if (!userId) {
      onSelectRole('venue')
      return
    }

    try {
      const updateData: UpdateUserRequest = {
        user: selectedRestaurantFormat
          ? {
              role: 'restaurant',
              restaurant_profile_attributes: { restaurant_format: selectedRestaurantFormat },
            }
          : {
              role: 'restaurant',
            },
      }

      if (!updateUser) {
        throw new Error('updateUser функция не определена')
      }

      await updateUser(userId, updateData)
      onSelectRole('venue')
    } catch (error) {
      onSelectRole('venue')
    }
  }, [selectedRestaurantFormat, onSelectRole, updateUser, isAuthenticated, userData])

  const handleBack = useCallback(() => {
    if (showEmployeeSubRoles) {
      setShowEmployeeSubRoles(false)
      setSelectedSubRole(null)
      setSelectedPositionValue(null)
    }
    if (showSupplierTypes) {
      setShowSupplierTypes(false)
      setSelectedSupplierType(null)
    }
    if (showRestaurantFormats) {
      setShowRestaurantFormats(false)
      setSelectedRestaurantFormat(null)
    }
  }, [showEmployeeSubRoles, showSupplierTypes, showRestaurantFormats])

  return {
    selectedRole: draftSelectedRole,
    showEmployeeSubRoles,
    showSupplierTypes,
    showRestaurantFormats,
    selectedSubRole,
    selectedSupplierType,
    selectedRestaurantFormat,
    mainRoles,
    isLoading,
    isFetching,
    error,
    roles,
    currentUserRole,
    employeeSubRoles,
    isLoadingPositions,
    isFetchingPositions,
    supplierTypes,
    isLoadingSupplierTypes,
    isFetchingSupplierTypes,
    restaurantFormats,
    isLoadingRestaurantFormats,
    isFetchingRestaurantFormats,
    handleRoleSelect,
    handleContinue,
    handleSubRoleSelect,
    handleSubRoleContinue,
    handleSupplierTypeSelect,
    handleSupplierTypeContinue,
    handleRestaurantFormatSelect,
    handleRestaurantFormatContinue,
    handleBack,
  }
}
