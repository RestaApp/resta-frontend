import { useCallback } from 'react'
import type { UiRole } from '@/types'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectSelectedRole, setSelectedRole } from '@/features/telegram/model/userSlice'

export const useRole = () => {
  const dispatch = useAppDispatch()
  const selectedRole = useAppSelector(selectSelectedRole)

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
