import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { getTabsForRole } from '@/constants/tabs'
import { SCREEN_TO_TAB_MAP } from '@/constants/navigation'
import type { Tab, UiRole, Screen } from '@/types'
import { consumeCommand, selectNavigationCommand } from '@/features/navigation/model/navigationSlice'

interface UseDashboardProps {
  role: UiRole
  onNavigate: (screen: Screen) => void
  currentScreen: Screen
}

const getScreenByTab = (tab: Tab): Screen | null => {
  const entry = Object.entries(SCREEN_TO_TAB_MAP).find(([, mappedTab]) => mappedTab === tab)
  return entry ? (entry[0] as Screen) : null
}

const getDefaultTab = (roleTabs: Array<{ id: Tab }>): Tab => roleTabs[0]?.id ?? 'feed'

export const useDashboard = ({ role, onNavigate, currentScreen }: UseDashboardProps) => {
  const dispatch = useAppDispatch()
  const command = useAppSelector(selectNavigationCommand)

  const tabs = useMemo(() => getTabsForRole(role), [role])
  const [activeTab, setActiveTab] = useState<Tab>(() => getDefaultTab(tabs))

  // 1) Роль поменялась — гарантируем валидный таб
  useEffect(() => {
    const allowed = new Set(tabs.map(t => t.id))
    setActiveTab(prev => (allowed.has(prev) ? prev : getDefaultTab(tabs)))
  }, [tabs])

  // 2) screen -> tab (внешняя синхронизация)
  useEffect(() => {
    const mapped = SCREEN_TO_TAB_MAP[currentScreen]
    if (!mapped) return
    setActiveTab(prev => (prev === mapped ? prev : mapped))
  }, [currentScreen])

  // 3) Команды навигации из Redux (consume-once)
  useEffect(() => {
    if (!command) return

    if (command.type === 'NAVIGATE_TAB') {
      setActiveTab(command.tab)
      const screen = getScreenByTab(command.tab)
      if (screen) onNavigate(screen)
      dispatch(consumeCommand())
      return
    }

    if (command.type === 'NAVIGATE_SCREEN') {
      onNavigate(command.screen)
      // activeTab синхронизируется через effect screen->tab
      dispatch(consumeCommand())
      return
    }

    if (command.type === 'RESET_HOME') {
      const home = getScreenByTab(getDefaultTab(tabs)) // или ROUTES.HOME, если HOME есть в map
      if (home) onNavigate(home)
      dispatch(consumeCommand())
    }
  }, [command, dispatch, onNavigate, tabs])

  const handleTabChange = useCallback(
    (tab: Tab) => {
      setActiveTab(tab)
      const screen = getScreenByTab(tab)
      if (screen) onNavigate(screen)
    },
    [onNavigate]
  )

  return { tabs, activeTab, handleTabChange }
}