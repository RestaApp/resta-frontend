/**
 * Redux slice для данных пользователя и роли
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserRole } from '../types'
import type { UserData } from '../services/api/authApi'
import { mapRoleFromApi } from '../utils/roles'

interface UserState {
  userData: UserData | null
  selectedRole: UserRole | null
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

      // Автоматически устанавливаем selectedRole на основе роли пользователя
      if (action.payload) {
        const mappedRole = mapRoleFromApi(action.payload.role)

        // Если роль unverified, оставляем selectedRole = null, чтобы показать RoleSelector
        // Если роль установлена и не unverified, устанавливаем selectedRole
        if (mappedRole && mappedRole !== 'unverified') {
          state.selectedRole = mappedRole
        } else {
          // Для unverified или неизвестной роли оставляем selectedRole = null
          state.selectedRole = null
        }
      } else {
        // Если userData = null, очищаем selectedRole
        state.selectedRole = null
      }
    },
    setSelectedRole: (state, action: PayloadAction<UserRole | null>) => {
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
