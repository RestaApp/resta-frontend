/**
 * Хук для логики страницы выбора роли
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useAppSelector } from '../../../store/hooks'
import { useRoles } from '../../../hooks/useRoles'
import { useUpdateUser } from '../../../hooks/useUsers'
import { useUserPositions } from '../../../hooks/useUserPositions'
import { useSupplierTypes } from '../../../hooks/useSupplierTypes'
import { useRestaurantFormats } from '../../../hooks/useRestaurantFormats'
import { mapRoleOptionsFromApi } from '../../../utils/rolesMapper'
import { mapRoleFromApi } from '../../../utils/roles'
import { logger } from '../../../utils/logger'
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
  const shouldFetchRoles = isAuthenticated && !hasAssignedRole
  const { roles, isLoading, isFetching, error } = useRoles({ skip: hasAssignedRole })
  
  // Проверяем, что функции определены и отслеживаем изменения userData
  useEffect(() => {
    logger.log('[useRoleSelector] Инициализация:', {
      isAuthenticated,
      hasAssignedRole,
      shouldFetchRoles,
      hasUpdateUser: !!updateUser,
      userData: userData ? { id: userData.id, role: userData.role } : null,
      userDataFull: userData,
    })
  }, [isAuthenticated, hasAssignedRole, shouldFetchRoles, updateUser, userData])
  
  // Отслеживаем изменения userData для отладки
  useEffect(() => {
    if (userData) {
      logger.log('[useRoleSelector] userData обновлен:', {
        id: userData.id,
        role: userData.role,
        full_name: userData.full_name,
      })
    } else {
      logger.warn('[useRoleSelector] userData пустой или null')
    }
  }, [userData])
  
  // Загружаем позиции только если выбрана роль employee (chef) И у пользователя еще нет роли
  const shouldLoadPositions = (selectedRole === 'chef' || showEmployeeSubRoles) && !hasAssignedRole
  
  useEffect(() => {
    logger.log('[useRoleSelector] Условие загрузки позиций:', {
      selectedRole,
      showEmployeeSubRoles,
      hasAssignedRole,
      shouldLoadPositions,
    })
  }, [selectedRole, showEmployeeSubRoles, hasAssignedRole, shouldLoadPositions])
  
  const {
    positionsApi: employeeSubRoles,
    isLoading: isLoadingPositions,
    isFetching: isFetchingPositions,
  } = useUserPositions({ enabled: shouldLoadPositions })

  // Загружаем типы поставщиков только если выбрана роль supplier И у пользователя еще нет роли
  const shouldLoadSupplierTypes = (selectedRole === 'supplier' || showSupplierTypes) && !hasAssignedRole

  useEffect(() => {
    logger.log('[useRoleSelector] Условие загрузки типов поставщиков:', {
      selectedRole,
      showSupplierTypes,
      hasAssignedRole,
      shouldLoadSupplierTypes,
    })
  }, [selectedRole, showSupplierTypes, hasAssignedRole, shouldLoadSupplierTypes])

  const {
    supplierTypes,
    isLoading: isLoadingSupplierTypes,
    isFetching: isFetchingSupplierTypes,
  } = useSupplierTypes({ enabled: shouldLoadSupplierTypes })

  // Загружаем форматы ресторанов только если выбрана роль venue И у пользователя еще нет роли
  const shouldLoadRestaurantFormats = (selectedRole === 'venue' || showRestaurantFormats) && !hasAssignedRole

  useEffect(() => {
    logger.log('[useRoleSelector] Условие загрузки форматов ресторанов:', {
      selectedRole,
      showRestaurantFormats,
      hasAssignedRole,
      shouldLoadRestaurantFormats,
    })
  }, [selectedRole, showRestaurantFormats, hasAssignedRole, shouldLoadRestaurantFormats])

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
      logger.log('[useRoleSelector] handleRoleSelect вызван с ролью:', roleId)
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
        logger.log('[useRoleSelector] Пользователь не авторизован, пропускаем запрос')
        onSelectRole(roleId)
        return
      }

      // Получаем userId
      let userId = userData?.id
      logger.log('[useRoleSelector] userId из userData:', userId)
      
      if (!userId) {
        try {
          const { store } = await import('../../../store')
          const state = store.getState()
          userId = state.user.userData?.id
          logger.log('[useRoleSelector] userId из store:', userId)
        } catch (error) {
          logger.error('[useRoleSelector] Ошибка при получении userId из store:', error)
        }
      }

      if (!userId) {
        logger.warn('[useRoleSelector] userId не найден, пропускаем запрос')
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
        
        logger.log('[useRoleSelector] ✅ Отправка запроса на обновление роли:', { 
          userId,
          updateData,
          endpoint: `PATCH /api/v1/users/${userId}`
        })
        const result = await updateUser(userId, updateData)
        logger.log('[useRoleSelector] ✅ Роль успешно обновлена! Результат:', result)
        onSelectRole(roleId)
      } catch (error) {
        logger.error('[useRoleSelector] ❌ ОШИБКА при обновлении роли:', error)
        logger.error('[useRoleSelector] Детали ошибки:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })
        // В случае ошибки все равно выбираем роль локально
        onSelectRole(roleId)
      }
    },
    [onSelectRole, updateUser, isAuthenticated, userData]
  )

  const handleContinue = useCallback(async () => {
    logger.log('[useRoleSelector] handleContinue вызван с ролью:', selectedRole)
    
    if (!selectedRole) {
      logger.warn('[useRoleSelector] Роль не выбрана')
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
      logger.log('[useRoleSelector] Пользователь не авторизован, пропускаем запрос')
      onSelectRole(selectedRole)
      return
    }

    // Получаем userId
    let userId = userData?.id
    logger.log('[useRoleSelector] userId из userData:', userId)
    
    if (!userId) {
      try {
        const { store } = await import('../../../store')
        const state = store.getState()
        userId = state.user.userData?.id
        logger.log('[useRoleSelector] userId из store:', userId)
      } catch (error) {
        logger.error('[useRoleSelector] Ошибка при получении userId из store:', error)
      }
    }

    if (!userId) {
      logger.warn('[useRoleSelector] userId не найден, пропускаем запрос')
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
      
      logger.log('[useRoleSelector] ✅ Отправка запроса на обновление роли:', { 
        userId,
        updateData,
        endpoint: `PATCH /api/v1/users/${userId}`
      })
      const result = await updateUser(userId, updateData)
      logger.log('[useRoleSelector] ✅ Роль успешно обновлена! Результат:', result)
      onSelectRole(selectedRole)
    } catch (error) {
      logger.error('[useRoleSelector] ❌ ОШИБКА при обновлении роли:', error)
      logger.error('[useRoleSelector] Детали ошибки:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      // В случае ошибки все равно выбираем роль локально
      onSelectRole(selectedRole)
    }
  }, [selectedRole, onSelectRole, updateUser, isAuthenticated, userData])

  const handleSubRoleSelect = useCallback((subRole: EmployeeRole, positionValue: string) => {
    logger.log('[useRoleSelector] handleSubRoleSelect вызван с подролью:', { subRole, positionValue })
    setSelectedSubRole(subRole)
    setSelectedPositionValue(positionValue)
  }, [])

  const handleSubRoleContinue = useCallback(async () => {
    logger.log('[useRoleSelector] ===== handleSubRoleContinue НАЧАЛО =====')
    logger.log('[useRoleSelector] Параметры:', { 
      selectedSubRole, 
      selectedPositionValue,
      isAuthenticated,
      userData: userData ? { id: userData.id, role: userData.role } : null
    })
    
    if (!selectedSubRole) {
      logger.warn('[useRoleSelector] ❌ Подроль не выбрана, выход')
      return
    }

    if (!isAuthenticated) {
      logger.log('[useRoleSelector] ⚠️ Пользователь не авторизован, пропускаем запрос')
      onSelectRole(selectedSubRole)
      return
    }

    let userId = userData?.id
    logger.log('[useRoleSelector] userId из userData:', userId, 'userData:', userData)
    
    if (!userId) {
      try {
        logger.log('[useRoleSelector] Пытаемся получить userId из store...')
        const { store } = await import('../../../store')
        const state = store.getState()
        userId = state.user.userData?.id
        logger.log('[useRoleSelector] userId из store:', userId, 'state.user:', state.user)
      } catch (error) {
        logger.error('[useRoleSelector] Ошибка при получении userId из store:', error)
      }
    }

    if (!userId) {
      logger.error('[useRoleSelector] ❌ userId не найден! userData:', userData)
      logger.error('[useRoleSelector] ❌ Пропускаем запрос')
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
      
      logger.log('[useRoleSelector] ✅ Отправка запроса на обновление роли и позиции:', { 
        userId, 
        updateData,
        endpoint: `PATCH /api/v1/users/${userId}`,
        hasUpdateUser: !!updateUser
      })
      
      if (!updateUser) {
        logger.error('[useRoleSelector] ❌ updateUser функция не определена!')
        throw new Error('updateUser функция не определена')
      }
      
      const result = await updateUser(userId, updateData)
      logger.log('[useRoleSelector] ✅ Роль и позиция успешно обновлены! Результат:', result)
      onSelectRole(selectedSubRole)
    } catch (error) {
      logger.error('[useRoleSelector] ❌ ОШИБКА при обновлении роли:', error)
      logger.error('[useRoleSelector] Детали ошибки:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      // В случае ошибки все равно выбираем роль локально
      onSelectRole(selectedSubRole)
    }
    
    logger.log('[useRoleSelector] ===== handleSubRoleContinue КОНЕЦ =====')
  }, [selectedSubRole, selectedPositionValue, onSelectRole, updateUser, isAuthenticated, userData])

  const handleSupplierTypeSelect = useCallback((typeValue: string) => {
    logger.log('[useRoleSelector] handleSupplierTypeSelect вызван с типом:', typeValue)
    setSelectedSupplierType(typeValue)
  }, [])

  const handleRestaurantFormatSelect = useCallback((formatValue: string) => {
    logger.log('[useRoleSelector] handleRestaurantFormatSelect вызван с форматом:', formatValue)
    setSelectedRestaurantFormat(formatValue)
  }, [])

  const handleSupplierTypeContinue = useCallback(async () => {
    logger.log('[useRoleSelector] ===== handleSupplierTypeContinue НАЧАЛО =====')
    logger.log('[useRoleSelector] Параметры:', { 
      selectedSupplierType, 
      isAuthenticated,
      userData: userData ? { id: userData.id, role: userData.role } : null
    })
    
    if (!selectedSupplierType) {
      logger.warn('[useRoleSelector] ❌ Тип поставщика не выбран, выход')
      return
    }

    if (!isAuthenticated) {
      logger.log('[useRoleSelector] ⚠️ Пользователь не авторизован, пропускаем запрос')
      onSelectRole('supplier')
      return
    }

    let userId = userData?.id
    logger.log('[useRoleSelector] userId из userData:', userId, 'userData:', userData)
    
    if (!userId) {
      try {
        logger.log('[useRoleSelector] Пытаемся получить userId из store...')
        const { store } = await import('../../../store')
        const state = store.getState()
        userId = state.user.userData?.id
        logger.log('[useRoleSelector] userId из store:', userId, 'state.user:', state.user)
      } catch (error) {
        logger.error('[useRoleSelector] Ошибка при получении userId из store:', error)
      }
    }

    if (!userId) {
      logger.error('[useRoleSelector] ❌ userId не найден! userData:', userData)
      logger.error('[useRoleSelector] ❌ Пропускаем запрос')
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
      
      logger.log('[useRoleSelector] ✅ Отправка запроса на обновление роли и типа поставщика:', { 
        userId, 
        updateData,
        endpoint: `PATCH /api/v1/users/${userId}`,
        hasUpdateUser: !!updateUser
      })
      
      if (!updateUser) {
        logger.error('[useRoleSelector] ❌ updateUser функция не определена!')
        throw new Error('updateUser функция не определена')
      }
      
      const result = await updateUser(userId, updateData)
      logger.log('[useRoleSelector] ✅ Роль и тип поставщика успешно обновлены! Результат:', result)
      onSelectRole('supplier')
    } catch (error) {
      logger.error('[useRoleSelector] ❌ ОШИБКА при обновлении роли:', error)
      logger.error('[useRoleSelector] Детали ошибки:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      // В случае ошибки все равно выбираем роль локально
      onSelectRole('supplier')
    }
    
    logger.log('[useRoleSelector] ===== handleSupplierTypeContinue КОНЕЦ =====')
  }, [selectedSupplierType, onSelectRole, updateUser, isAuthenticated, userData])

  const handleRestaurantFormatContinue = useCallback(async () => {
    logger.log('[useRoleSelector] ===== handleRestaurantFormatContinue НАЧАЛО =====')
    logger.log('[useRoleSelector] Параметры:', { 
      selectedRestaurantFormat, 
      isAuthenticated,
      userData: userData ? { id: userData.id, role: userData.role } : null
    })
    
    if (!selectedRestaurantFormat) {
      logger.warn('[useRoleSelector] ❌ Формат ресторана не выбран, выход')
      return
    }

    if (!isAuthenticated) {
      logger.log('[useRoleSelector] ⚠️ Пользователь не авторизован, пропускаем запрос')
      onSelectRole('venue')
      return
    }

    let userId = userData?.id
    logger.log('[useRoleSelector] userId из userData:', userId, 'userData:', userData)
    
    if (!userId) {
      try {
        logger.log('[useRoleSelector] Пытаемся получить userId из store...')
        const { store } = await import('../../../store')
        const state = store.getState()
        userId = state.user.userData?.id
        logger.log('[useRoleSelector] userId из store:', userId, 'state.user:', state.user)
      } catch (error) {
        logger.error('[useRoleSelector] Ошибка при получении userId из store:', error)
      }
    }

    if (!userId) {
      logger.error('[useRoleSelector] ❌ userId не найден! userData:', userData)
      logger.error('[useRoleSelector] ❌ Пропускаем запрос')
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
      
      logger.log('[useRoleSelector] ✅ Отправка запроса на обновление роли и формата ресторана:', { 
        userId, 
        updateData,
        endpoint: `PATCH /api/v1/users/${userId}`,
        hasUpdateUser: !!updateUser
      })
      
      if (!updateUser) {
        logger.error('[useRoleSelector] ❌ updateUser функция не определена!')
        throw new Error('updateUser функция не определена')
      }
      
      const result = await updateUser(userId, updateData)
      logger.log('[useRoleSelector] ✅ Роль и формат ресторана успешно обновлены! Результат:', result)
      onSelectRole('venue')
    } catch (error) {
      logger.error('[useRoleSelector] ❌ ОШИБКА при обновлении роли:', error)
      logger.error('[useRoleSelector] Детали ошибки:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      // В случае ошибки все равно выбираем роль локально
      onSelectRole('venue')
    }
    
    logger.log('[useRoleSelector] ===== handleRestaurantFormatContinue КОНЕЦ =====')
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


