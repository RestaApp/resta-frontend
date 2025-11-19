/**
 * Хук для работы с ролями пользователя
 */

import { useState, useCallback } from 'react'
import type { UserRole } from '../types'
import { getStoredRole, setStoredRole } from '../utils/storage'

export function useRole() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(() => getStoredRole())

  const handleRoleSelect = useCallback((role: UserRole) => {
    setStoredRole(role)
    setSelectedRole(role)
  }, [])

  const handleRoleReset = useCallback(() => {
    localStorage.removeItem('user_role')
    setSelectedRole(null)
  }, [])

  return {
    selectedRole,
    setSelectedRole,
    handleRoleSelect,
    handleRoleReset,
  }
}

