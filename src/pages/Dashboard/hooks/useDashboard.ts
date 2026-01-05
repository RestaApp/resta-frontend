/**
 * Хук для логики Dashboard
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { getTabsForRole } from '@/constants/tabs'
import { SCREEN_TO_TAB_MAP } from '@/constants/navigation'
import type { Tab, UiRole, Screen } from '@/types'

interface UseDashboardProps {
  role: UiRole
  onNavigate?: (screen: Screen) => void
  currentScreen?: Screen | null
}

export const useDashboard = ({ role, onNavigate, currentScreen = null }: UseDashboardProps) => {
  const tabs = useMemo(() => getTabsForRole(role), [role])
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]?.id ?? 'home')

  // Синхронизация внешнего currentScreen -> activeTab
  useEffect(() => {
    if (!currentScreen) return
    const mappedTab = SCREEN_TO_TAB_MAP[currentScreen]
    if (mappedTab && mappedTab !== activeTab) {
      setActiveTab(mappedTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen, tabs])

  const handleTabChange = useCallback(
    (tab: Tab) => {
      setActiveTab(tab)
      if (!onNavigate) return
      // найти screen по табу
      const entry = Object.entries(SCREEN_TO_TAB_MAP).find(([, mappedTab]) => mappedTab === tab)
      if (entry) {
        const screen = entry[0] as Screen
        onNavigate(screen)
      }
    },
    [onNavigate]
  )

  return {
    tabs,
    activeTab,
    handleTabChange,
    setActiveTab,
  }
}

