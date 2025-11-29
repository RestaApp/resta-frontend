/**
 * Хук для логики страницы выбора роли
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { UserRole, EmployeeRole } from '../../../types'
import { useRoles } from '../../../hooks/useRoles'
import { useUpdateUser } from '../../../hooks/useUsers'
import { useUserPositions } from '../../../hooks/useUserPositions'
import { mapRoleOptionsFromApi } from '../../../utils/rolesMapper'
import { useAuth } from '../../../contexts/AuthContext'
import { useAppSelector } from '../../../store/hooks'
import { logger } from '../../../utils/logger'
import { mapRoleFromApi } from '../../../utils/roles'
import type { PositionApiItem } from '../../../services/api/usersApi'

interface UseRoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export function useRoleSelector({ onSelectRole }: UseRoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [showEmployeeSubRoles, setShowEmployeeSubRoles] = useState(false)
  const [selectedSubRole, setSelectedSubRole] = useState<EmployeeRole | null>(null)
  const [selectedPositionValue, setSelectedPositionValue] = useState<string | null>(null)

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

      // Для заведения и поставщика отправляем на сервер через PATCH /api/v1/users/:id
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
        // Для venue и supplier отправляем role и position через PATCH /api/v1/users/:id
        // Используем API-значения для поля role (restaurant/supplier) и position
        const apiRoleValue = roleId === 'venue' ? 'restaurant' : roleId === 'supplier' ? 'supplier' : roleId
        const updateData: { role: string; position?: string } = { role: apiRoleValue }
        if (apiRoleValue) {
          updateData.position = apiRoleValue
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
    
    if (selectedRole === 'chef') {
      setShowEmployeeSubRoles(true)
      return
    }

    if (!selectedRole) {
      logger.warn('[useRoleSelector] Роль не выбрана')
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
      // Для venue и supplier отправляем role и position через PATCH /api/v1/users/:id
      // Используем API-значения для поля role (restaurant/supplier) и position
      const apiRoleValue = selectedRole === 'venue' ? 'restaurant' : selectedRole === 'supplier' ? 'supplier' : selectedRole
      const updateData: { role: string; position?: string } = { role: apiRoleValue }
      if (apiRoleValue) {
        updateData.position = apiRoleValue
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
      // Указываем role как 'employee' (API ожидает именно это значение) и position как значение позиции из API
      const updateData: { role: string; position?: string } = { role: 'employee' }
      if (selectedPositionValue) {
        updateData.position = selectedPositionValue
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

  const handleBack = useCallback(() => {
    setShowEmployeeSubRoles(false)
    setSelectedSubRole(null)
    setSelectedPositionValue(null)
  }, [])

  return {
    selectedRole,
    showEmployeeSubRoles,
    selectedSubRole,
    mainRoles,
    isLoading,
    isFetching,
    error,
    roles,
    currentUserRole,
    employeeSubRoles: employeeSubRoles as PositionApiItem[] | undefined,
    isLoadingPositions,
    isFetchingPositions,
    handleRoleSelect,
    handleContinue,
    handleSubRoleSelect,
    handleSubRoleContinue,
    handleBack,
  }
}


