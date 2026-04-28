import { createSlice, type PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store/index'
import type { Tab } from '@/types'

type NavigationCommand = { type: 'NAVIGATE_TAB'; tab: Tab }

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
    navigateToTab: (state, action: PayloadAction<Tab>) => {
      state.command = { type: 'NAVIGATE_TAB', tab: action.payload }
    },
    consumeCommand: state => {
      state.command = null
    },
  },
})

export const { navigateToTab, consumeCommand } = navigationSlice.actions
export default navigationSlice.reducer

const selectNav = (state: RootState) => state.navigation
export const selectNavigationCommand = createSelector([selectNav], s => s.command)
