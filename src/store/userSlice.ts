/**
 * Redux slice для данных пользователя и роли
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserRole } from '../types'
import type { UserData } from '../services/api/authApi'
import { mapRoleFromApi } from '../utils/roles'
import { logger } from '../utils/logger'

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
      logger.log('[userSlice] setUserData вызван:', {
        hasPayload: !!action.payload,
        userId: action.payload?.id,
        role: action.payload?.role,
      })
      
      state.userData = action.payload

      // Автоматически устанавливаем selectedRole на основе роли пользователя
      if (action.payload) {
        const mappedRole = mapRoleFromApi(action.payload.role)
        logger.log('[userSlice] Маппинг роли:', {
          originalRole: action.payload.role,
          mappedRole,
        })
        
        // Если роль unverified, оставляем selectedRole = null, чтобы показать RoleSelector
        // Если роль установлена и не unverified, устанавливаем selectedRole
        if (mappedRole && mappedRole !== 'unverified') {
          state.selectedRole = mappedRole
          logger.log('[userSlice] selectedRole установлен:', mappedRole)
        } else {
          // Для unverified или неизвестной роли оставляем selectedRole = null
          state.selectedRole = null
          logger.log('[userSlice] selectedRole = null (unverified или неизвестная роль)')
        }
      } else {
        // Если userData = null, очищаем selectedRole
        state.selectedRole = null
        logger.log('[userSlice] userData = null, selectedRole очищен')
      }
      
      logger.log('[userSlice] Состояние обновлено:', {
        hasUserData: !!state.userData,
        userId: state.userData?.id,
        selectedRole: state.selectedRole,
      })
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

