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
import type { PositionApiItem, UpdateUserRequest } from '../../../services/api/usersApi'
import type { UserRole, EmployeeRole } from '../../../types'

interface UseRoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export function useRoleSelector({ onSelectRole }: UseRoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
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
  
  // Проверяем, есть ли у пользователя уже присвоенная роль (не unverified)
  const hasAssignedRole = useMemo(() => {
    if (!userData?.role) {
      return false
    }
    // Если роль "unverified", считаем, что роль еще не присвоена
    const normalizedRole = userData.role.toLowerCase().trim()
    return normalizedRole !== 'unverified'
  }, [userData?.role])
  
  // Запрашиваем роли только если пользователь авторизован И у него еще нет роли (или роль unverified)
  const { roles, isLoading, isFetching, error } = useRoles({ skip: hasAssignedRole })
  
  // Загружаем позиции только если выбрана роль employee (chef) И у пользователя еще нет роли
  const shouldLoadPositions = (selectedRole === 'chef' || showEmployeeSubRoles) && !hasAssignedRole
  
  const {
    positionsApi: employeeSubRoles,
    isLoading: isLoadingPositions,
    isFetching: isFetchingPositions,
  } = useUserPositions({ enabled: shouldLoadPositions })

  // Загружаем типы поставщиков только если выбрана роль supplier И у пользователя еще нет роли
  const shouldLoadSupplierTypes = (selectedRole === 'supplier' || showSupplierTypes) && !hasAssignedRole

  const {
    supplierTypes,
    isLoading: isLoadingSupplierTypes,
    isFetching: isFetchingSupplierTypes,
  } = useSupplierTypes({ enabled: shouldLoadSupplierTypes })

  // Загружаем форматы ресторанов только если выбрана роль venue И у пользователя еще нет роли
  const shouldLoadRestaurantFormats = (selectedRole === 'venue' || showRestaurantFormats) && !hasAssignedRole

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
      setSelectedRole(roleId)
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

      // Получаем userId
      let userId = userData?.id
      
      if (!userId) {
        try {
          const { store } = await import('../../../store')
          const state = store.getState()
          userId = state.user.userData?.id
        } catch (error) {
          // Ошибка при получении userId из store
        }
      }

      if (!userId) {
        onSelectRole(roleId)
        return
      }

      try {
        // Для остальных ролей отправляем role через PATCH /api/v1/users/:id
        // Формат: { user: { role: "role_name" } }
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
    [onSelectRole, updateUser, isAuthenticated, userData]
  )

  const handleContinue = useCallback(async () => {
    if (!selectedRole) {
      return
    }

    if (selectedRole === 'chef') {
      setShowEmployeeSubRoles(true)
      return
    }

    if (selectedRole === 'supplier') {
      setShowSupplierTypes(true)
      return
    }

    if (selectedRole === 'venue') {
      setShowRestaurantFormats(true)
      return
    }

    if (!isAuthenticated) {
      onSelectRole(selectedRole)
      return
    }

    // Получаем userId
    let userId = userData?.id
    
    if (!userId) {
      try {
        const { store } = await import('../../../store')
        const state = store.getState()
        userId = state.user.userData?.id
      } catch (error) {
        // Ошибка при получении userId из store
      }
    }

    if (!userId) {
      onSelectRole(selectedRole)
      return
    }

    try {
      // Для остальных ролей отправляем на сервер
      // Формат: { user: { role: "role_name" } }
      const updateData: UpdateUserRequest = {
        user: {
          role: selectedRole,
        },
      }
      
      await updateUser(userId, updateData)
      onSelectRole(selectedRole)
    } catch (error) {
      // В случае ошибки все равно выбираем роль локально
      onSelectRole(selectedRole)
    }
  }, [selectedRole, onSelectRole, updateUser, isAuthenticated, userData])

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

    let userId = userData?.id
    
    if (!userId) {
      try {
        const { store } = await import('../../../store')
        const state = store.getState()
        userId = state.user.userData?.id
      } catch (error) {
        // Ошибка при получении userId из store
      }
    }

    if (!userId) {
      onSelectRole(selectedSubRole)
      return
    }

      try {
        // Для employee отправляем role и position через PATCH /api/v1/users/:id
        // Формат: { user: { role: "employee", position: "bartender" } }
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
      // В случае ошибки все равно выбираем роль локально
      onSelectRole(selectedSubRole)
    }
  }, [selectedSubRole, selectedPositionValue, onSelectRole, updateUser, isAuthenticated, userData])

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

    let userId = userData?.id
    
    if (!userId) {
      try {
        const { store } = await import('../../../store')
        const state = store.getState()
        userId = state.user.userData?.id
      } catch (error) {
        // Ошибка при получении userId из store
      }
    }

    if (!userId) {
      onSelectRole('supplier')
      return
    }

      try {
        // Для supplier отправляем role и supplier_type через PATCH /api/v1/users/:id
        // Формат: { user: { role: "supplier", supplier_profile_attributes: { supplier_type: "products" } } }
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
      // В случае ошибки все равно выбираем роль локально
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

    let userId = userData?.id
    
    if (!userId) {
      try {
        const { store } = await import('../../../store')
        const state = store.getState()
        userId = state.user.userData?.id
      } catch (error) {
        // Ошибка при получении userId из store
      }
    }

    if (!userId) {
      onSelectRole('venue')
      return
    }

      try {
        // Для venue отправляем role и restaurant_format через PATCH /api/v1/users/:id
        // Формат: { user: { role: "restaurant", restaurant_profile_attributes: { restaurant_format: "full_service" } } }
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
      // В случае ошибки все равно выбираем роль локально
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
    selectedRole,
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
    employeeSubRoles: employeeSubRoles as PositionApiItem[] | undefined,
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


