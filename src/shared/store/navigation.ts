import { createAction, createSelector } from '@reduxjs/toolkit'
import type { Tab } from '@/shared/types/navigation.types'
import type { RootState } from '@/store'

type NavigationCommand = { type: 'NAVIGATE_TAB'; tab: Tab }

export const navigateToTab = createAction<Tab>('navigation/navigateToTab')
export const consumeCommand = createAction('navigation/consumeCommand')

const selectNavigationState = (state: RootState) => state.navigation

export const selectNavigationCommand = createSelector(
  [selectNavigationState],
  s => s.command as NavigationCommand | null
)
