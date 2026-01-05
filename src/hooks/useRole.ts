import { useCallback } from 'react'
import type { UiRole } from '@/types'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setSelectedRole } from '@/store/userSlice'

export const useRole = () => {
  const dispatch = useAppDispatch()
  const selectedRole = useAppSelector(state => state.user.selectedRole)

  const handleRoleSelect = useCallback((role: UiRole) => {
    dispatch(setSelectedRole(role))
  }, [dispatch])

  const handleRoleReset = useCallback(() => {
    dispatch(setSelectedRole(null))
  }, [dispatch])

  return {
    selectedRole,
    handleRoleSelect,
    handleRoleReset,
  }
}