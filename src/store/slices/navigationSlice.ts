import { createSlice, type PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store/index'
import type { Tab } from '@/shared/types/navigation.types'

type NavigationCommand = { type: 'NAVIGATE_TAB'; tab: Tab }

interface NavigationState {
  command: NavigationCommand | null
  isStaffApplicationsOpen: boolean
}

const initialState: NavigationState = {
  command: null,
  isStaffApplicationsOpen: false,
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setStaffApplicationsOpen: (state, action: PayloadAction<boolean>) => {
      state.isStaffApplicationsOpen = action.payload
    },
    navigateToTab: (state, action: PayloadAction<Tab>) => {
      state.command = { type: 'NAVIGATE_TAB', tab: action.payload }
    },
    consumeCommand: state => {
      state.command = null
    },
  },
})

export const { navigateToTab, consumeCommand, setStaffApplicationsOpen } = navigationSlice.actions
export default navigationSlice.reducer

const selectNav = (state: RootState) => state.navigation
export const selectNavigationCommand = createSelector([selectNav], s => s.command)
export const selectStaffApplicationsOpen = createSelector(
  [selectNav],
  s => s.isStaffApplicationsOpen
)
