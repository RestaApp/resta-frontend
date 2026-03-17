/**
 * Хук для логики Dashboard
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { getTabsForRole } from '@/constants/tabs'
import { SCREEN_TO_TAB_MAP, TAB_TO_SCREEN_MAP } from '@/constants/navigation'
import type { Tab, UiRole, Screen } from '@/types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'
import { isEmployeeRole } from '@/utils/roles'
import {
  consumeCommand,
  selectNavigationCommand,
} from '@/features/navigation/model/navigationSlice'

interface UseDashboardProps {
  role: UiRole
  onNavigate?: (screen: Screen) => void
  currentScreen?: Screen | null
}

export const useDashboard = ({ role, onNavigate, currentScreen = null }: UseDashboardProps) => {
  const dispatch = useAppDispatch()
  const navigationCommand = useAppSelector(selectNavigationCommand)
  const tabs = useMemo(() => getTabsForRole(role), [role])
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]?.id ?? 'home')
  const scheduleTabUpdate = useCallback((nextTab: Tab) => {
    queueMicrotask(() => {
      setActiveTab(prev => (prev === nextTab ? prev : nextTab))
    })
  }, [])

  // Проверка флага для перехода на Feed с вкладкой смен
  useEffect(() => {
    const shouldNavigateToFeed = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS)
    if (shouldNavigateToFeed === 'true') {
      scheduleTabUpdate('feed')
      removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS)
    }
  }, [scheduleTabUpdate])

  useEffect(() => {
    if (!navigationCommand) return

    if (navigationCommand.type === 'NAVIGATE_TAB') {
      const tabAllowed = tabs.some(t => t.id === navigationCommand.tab)
      if (tabAllowed && navigationCommand.tab !== activeTab) {
        scheduleTabUpdate(navigationCommand.tab)
      }
      dispatch(consumeCommand())
      return
    }

    if (navigationCommand.type === 'NAVIGATE_SCREEN') {
      const mappedTab = SCREEN_TO_TAB_MAP[navigationCommand.screen]
      const tabAllowed = mappedTab && tabs.some(t => t.id === mappedTab)
      if (tabAllowed && mappedTab !== activeTab) {
        scheduleTabUpdate(mappedTab)
      }
      dispatch(consumeCommand())
      return
    }

    if (navigationCommand.type === 'RESET_HOME') {
      if (tabs[0]?.id && tabs[0].id !== activeTab) {
        scheduleTabUpdate(tabs[0].id)
      }
      dispatch(consumeCommand())
    }
  }, [activeTab, dispatch, navigationCommand, scheduleTabUpdate, tabs])

  // Синхронизация внешнего currentScreen -> activeTab (только если таб есть у текущей роли)
  useEffect(() => {
    if (!currentScreen) return
    const mappedTab = SCREEN_TO_TAB_MAP[currentScreen]
    const tabAllowed = mappedTab && tabs.some(t => t.id === mappedTab)
    if (tabAllowed && mappedTab !== activeTab) {
      scheduleTabUpdate(mappedTab)
    }
  }, [activeTab, currentScreen, scheduleTabUpdate, tabs])

  const handleTabChange = useCallback(
    (tab: Tab) => {
      setActiveTab(tab)
      const screen = TAB_TO_SCREEN_MAP[tab]
      if (screen && onNavigate) onNavigate(screen)

      if (tab === 'activity' && isEmployeeRole(role) && typeof window !== 'undefined') {
        const shown = getLocalStorageItem(STORAGE_KEYS.ACTIVITY_ADD_SHIFT_ONBOARDING_SHOWN)
        if (!shown) {
          setLocalStorageItem(STORAGE_KEYS.ACTIVITY_ADD_SHIFT_ONBOARDING_SHOWN, '1')
          window.dispatchEvent(new Event('showActivityAddShiftOnboarding'))
        }
      }
    },
    [onNavigate, role]
  )

  return {
    tabs,
    activeTab,
    handleTabChange,
    setActiveTab,
  }
}
