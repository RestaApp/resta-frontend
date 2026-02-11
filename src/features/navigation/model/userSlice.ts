import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UiRole, ApiRole } from '@/types'
import type { UserData } from '@/services/api/authApi'
import { mapRoleFromApi, mapApiRoleToDefaultUiRole, isVerifiedRole } from '@/utils/roles'
import type { RootState } from '@/store/index'

interface UserState {
  userData: (UserData & { role?: ApiRole | string | null }) | null
  selectedRole: UiRole | null
}

const initialState: UserState = {
  userData: null,
  selectedRole: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData | null>) => {
      state.userData = action.payload

      if (!action.payload) {
        state.selectedRole = null
        return
      }

      const apiRole = mapRoleFromApi(action.payload.role)
      state.selectedRole = isVerifiedRole(apiRole) ? mapApiRoleToDefaultUiRole(apiRole) : null
    },

    setSelectedRole: (state, action: PayloadAction<UiRole | null>) => {
      state.selectedRole = action.payload
    },

    clearUserData: state => {
      state.userData = null
      state.selectedRole = null
    },
  },
})

export const { setUserData, setSelectedRole, clearUserData } = userSlice.actions
export default userSlice.reducer

const selectUserState = (state: RootState) => state.user

export const selectUserData = createSelector([selectUserState], s => s.userData)
export const selectSelectedRole = createSelector([selectUserState], s => s.selectedRole)
export const selectUserId = createSelector([selectUserData], u => u?.id)
export const selectUserPosition = createSelector(
  [selectUserData],
  u => u?.position || u?.employee_profile?.position || null
)
