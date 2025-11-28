/**
 * Хук для логики страницы выбора роли
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { UserRole, EmployeeRole } from '../../../types'
import { useRoles } from '../../../hooks/useRoles'
import { useUpdateUser } from '../../../hooks/useUsers'
import { mapRoleOptionsFromApi } from '../../../utils/rolesMapper'
import { useAuth } from '../../../contexts/AuthContext'
import { useAppSelector } from '../../../store/hooks'

interface UseRoleSelectorProps {
  onSelectRole: (role: UserRole) => void
}

export function useRoleSelector({ onSelectRole }: UseRoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [showEmployeeSubRoles, setShowEmployeeSubRoles] = useState(false)
  const [selectedSubRole, setSelectedSubRole] = useState<EmployeeRole | null>(null)

  const { isAuthenticated } = useAuth()
  const userData = useAppSelector(state => state.user.userData)
  const { updateUser } = useUpdateUser()
  const { roles, isLoading, isFetching, error, refetch } = useRoles()

  // Принудительно выполняем запрос при изменении авторизации
  useEffect(() => {
    if (isAuthenticated && !isLoading && !isFetching && roles.length === 0 && !error) {
      refetch()
    }
  }, [isAuthenticated, isLoading, isFetching, roles.length, error, refetch])

  // Преобразуем данные из API в формат компонентов
  const mainRoles = useMemo(() => {
    if (roles.length === 0) {
      return []
    }
    return mapRoleOptionsFromApi(roles)
  }, [roles])

  const handleRoleSelect = useCallback(
    async (roleId: UserRole) => {
      setSelectedRole(roleId)
      // Если выбрали сотрудника, показываем экран подролей
      if (roleId === 'chef') {
        setShowEmployeeSubRoles(true)
      } else {
        // Для заведения и поставщика сразу выбираем роль и отправляем на сервер
        if (!isAuthenticated) {
          onSelectRole(roleId)
          return
        }

        // Если userData еще не загружен, пытаемся получить его из store напрямую
        let userId = userData?.id
        if (!userId) {
          try {
            const { store } = await import('../../../store')
            const state = store.getState()
            userId = state.user.userData?.id
          } catch {
            // Игнорируем ошибки
          }
        }

        if (!userId) {
          onSelectRole(roleId)
          return
        }

        try {
          await updateUser(userId, { role: roleId })
          onSelectRole(roleId)
        } catch {
          // В случае ошибки все равно выбираем роль локально
          onSelectRole(roleId)
        }
      }
    },
    [onSelectRole, updateUser, isAuthenticated, userData]
  )

  const handleContinue = useCallback(async () => {
    if (selectedRole === 'chef') {
      setShowEmployeeSubRoles(true)
    } else if (selectedRole) {
      if (!isAuthenticated) {
        onSelectRole(selectedRole)
        return
      }

      let userId = userData?.id
      if (!userId) {
        try {
          const { store } = await import('../../../store')
          const state = store.getState()
          userId = state.user.userData?.id
        } catch {
          // Игнорируем ошибки
        }
      }

      if (!userId) {
        onSelectRole(selectedRole)
        return
      }

      try {
        await updateUser(userId, { role: selectedRole })
        onSelectRole(selectedRole)
      } catch {
        // В случае ошибки все равно выбираем роль локально
        onSelectRole(selectedRole)
      }
    }
  }, [selectedRole, onSelectRole, updateUser, isAuthenticated, userData])

  const handleSubRoleSelect = useCallback((subRole: EmployeeRole) => {
    setSelectedSubRole(subRole)
  }, [])

  const handleSubRoleContinue = useCallback(async () => {
    if (selectedSubRole) {
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
        } catch {
          // Игнорируем ошибки
        }
      }

      if (!userId) {
        onSelectRole(selectedSubRole)
        return
      }

      try {
        await updateUser(userId, { role: selectedSubRole })
        onSelectRole(selectedSubRole)
      } catch {
        // В случае ошибки все равно выбираем роль локально
        onSelectRole(selectedSubRole)
      }
    }
  }, [selectedSubRole, onSelectRole, updateUser, isAuthenticated, userData])

  const handleBack = useCallback(() => {
    setShowEmployeeSubRoles(false)
    setSelectedSubRole(null)
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
    handleRoleSelect,
    handleContinue,
    handleSubRoleSelect,
    handleSubRoleContinue,
    handleBack,
  }
}


