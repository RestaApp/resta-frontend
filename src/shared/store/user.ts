import { createAction, createSelector } from '@reduxjs/toolkit'
import type { UserData } from '@/services/api/authApi'
import type { ApiRole, UiRole } from '@/shared/types/roles.types'
import type { RootState } from '@/store'

export const setUserData = createAction<UserData | null>('user/setUserData')
export const setSelectedRole = createAction<UiRole | null>('user/setSelectedRole')
export const clearUserData = createAction('user/clearUserData')

const selectUserState = (state: RootState) => state.user

export const selectUserData = createSelector([selectUserState], s => s.userData)
export const selectSelectedRole = createSelector([selectUserState], s => s.selectedRole)
export const selectUserId = createSelector([selectUserData], u => u?.id)
export const selectUserPosition = createSelector(
  [selectUserData],
  u => u?.position || u?.employee_profile?.position || null
)
export const selectUserCity = createSelector([selectUserData], u => u?.city || null)

export interface SharedUserState {
  userData: (UserData & { role?: ApiRole | string | null }) | null
  selectedRole: UiRole | null
}
