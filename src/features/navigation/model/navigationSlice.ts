import { createSlice, type PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store/index'
import type { Screen, Tab } from '@/types'

type NavigationCommand =
  | { type: 'NAVIGATE_SCREEN'; screen: Screen }
  | { type: 'NAVIGATE_TAB'; tab: Tab }
  | { type: 'RESET_HOME' }

interface NavigationState {
  command: NavigationCommand | null
}

const initialState: NavigationState = {
  command: null,
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    navigateToScreen: (state, action: PayloadAction<Screen>) => {
      state.command = { type: 'NAVIGATE_SCREEN', screen: action.payload }
    },
    navigateToTab: (state, action: PayloadAction<Tab>) => {
      state.command = { type: 'NAVIGATE_TAB', tab: action.payload }
    },
    resetHome: state => {
      state.command = { type: 'RESET_HOME' }
    },
    consumeCommand: state => {
      state.command = null
    },
  },
})

export const { navigateToScreen, navigateToTab, resetHome, consumeCommand } =
  navigationSlice.actions
export default navigationSlice.reducer

const selectNav = (state: RootState) => state.navigation
export const selectNavigationCommand = createSelector([selectNav], s => s.command)
