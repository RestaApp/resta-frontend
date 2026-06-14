/**
 * Хук для логики Dashboard
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { getTabsForRole } from '@/shared/constants/tabs'
import { getScreenForTab, getTabForScreen } from '@/shared/constants/navigation'
import type { Tab, Screen } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from '@/shared/utils/localStorage'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { isEmployeeRole } from '@/shared/utils/roles'
import {
  consumeCommand,
  selectNavigationCommand,
} from '@/features/navigation/model/navigationSlice'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'

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
  const setTabIfChanged = useCallback((nextTab: Tab) => {
    setActiveTab(prev => (prev === nextTab ? prev : nextTab))
  }, [])
  const syncRouteForTab = useCallback(
    (tab: Tab) => {
      const screen = getScreenForTab(role, tab)
      if (!screen) return
      if (onNavigate) onNavigate(screen)
    },
    [onNavigate, role]
  )

  /* eslint-disable react-hooks/set-state-in-effect --
     Все три эффекта ниже — external sync (localStorage flag, Redux navigation command,
     prop currentScreen из роутера). setState внутри effect здесь осознанный pattern:
     внешний источник истины меняется → синхронизируем activeTab. Альтернатива через
     useSyncExternalStore требует обёрток для каждого источника и не упрощает код. */

  // External sync: localStorage flag → activeTab (mount‑once handler).
  useEffect(() => {
    const shouldNavigateToFeed = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS)
    if (shouldNavigateToFeed === 'true') {
      setTabIfChanged('feed')
      removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS)
    }
  }, [setTabIfChanged])

  // External sync: Redux navigation command → activeTab + screen/URL + consumeCommand.
  useEffect(() => {
    if (!navigationCommand) return

    if (navigationCommand.type === 'NAVIGATE_TAB') {
      const tabAllowed = tabs.some(t => t.id === navigationCommand.tab)
      if (tabAllowed) {
        setTabIfChanged(navigationCommand.tab)
        syncRouteForTab(navigationCommand.tab)
      }
      dispatch(consumeCommand())
    }
  }, [dispatch, navigationCommand, setTabIfChanged, syncRouteForTab, tabs])

  // External sync: prop currentScreen (из роутера/URL) → activeTab.
  useEffect(() => {
    if (!currentScreen) return
    const mappedTab = getTabForScreen(role, currentScreen)
    const tabAllowed = mappedTab && tabs.some(t => t.id === mappedTab)
    if (tabAllowed && mappedTab !== activeTab) {
      setTabIfChanged(mappedTab)
    }
  }, [activeTab, currentScreen, role, setTabIfChanged, tabs])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleTabChange = useCallback(
    (tab: Tab) => {
      setActiveTab(tab)
      syncRouteForTab(tab)

      if (tab === 'activity' && isEmployeeRole(role) && typeof window !== 'undefined') {
        const shown = getLocalStorageItem(STORAGE_KEYS.ACTIVITY_ADD_SHIFT_ONBOARDING_SHOWN)
        if (!shown) {
          setLocalStorageItem(STORAGE_KEYS.ACTIVITY_ADD_SHIFT_ONBOARDING_SHOWN, '1')
          emitAppEvent(APP_EVENTS.SHOW_ACTIVITY_ADD_SHIFT_ONBOARDING)
        }
      }
    },
    [role, syncRouteForTab]
  )

  return {
    tabs,
    activeTab,
    handleTabChange,
    setActiveTab,
  }
}
