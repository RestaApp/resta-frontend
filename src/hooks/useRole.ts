/**
 * Хук для работы с ролями пользователя
 * Использует Redux для хранения состояния
 */

import { useCallback } from 'react'
import type { UserRole } from '@/types'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setSelectedRole } from '@/store/userSlice'

export const useRole = () => {
  const dispatch = useAppDispatch()
  const selectedRole = useAppSelector(state => state.user.selectedRole)

  const handleRoleSelect = useCallback(
    (role: UserRole) => {
      dispatch(setSelectedRole(role))
    },
    [dispatch]
  )

  const handleRoleReset = useCallback(() => {
    dispatch(setSelectedRole(null))
  }, [dispatch])

  return {
    selectedRole,
    setSelectedRole: (role: UserRole | null) => dispatch(setSelectedRole(role)),
    handleRoleSelect,
    handleRoleReset,
  }
}
