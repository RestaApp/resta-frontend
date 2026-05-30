/**
 * Константы для навигации и синхронизации табов
 */

import type { Screen, Tab } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'
import { ROUTES } from './routes'
import { isEmployeeRole } from '@/shared/utils/roles'

/**
 * Маппинг экранов на табы для синхронизации
 */
const SCREEN_TO_TAB_MAP: Record<Screen, Tab | null> = {
  [ROUTES.LOADING]: null,
  [ROUTES.HOME]: 'feed',
  [ROUTES.SHIFTS]: 'activity',
  [ROUTES.VACANCIES]: 'activity',
  [ROUTES.NOTIFICATIONS]: null,
  [ROUTES.PROFILE]: 'profile',
  [ROUTES.SETTINGS]: 'profile',
  [ROUTES.CREATE_SHIFT]: null,
  [ROUTES.SUPPLIERS]: 'suppliers',
  [ROUTES.FIND_REPLACEMENT]: null,
  [ROUTES.WORK_MANAGEMENT]: null,
  [ROUTES.APPLICATIONS]: 'staff',
} as const

/** Обратный маппинг: таб → первый экран (для onNavigate при смене таба) */
const TAB_TO_SCREEN_MAP: Partial<Record<Tab, Screen>> = (() => {
  const map: Partial<Record<Tab, Screen>> = {}
  for (const [screen, tab] of Object.entries(SCREEN_TO_TAB_MAP) as [Screen, Tab | null][]) {
    if (tab != null && !(tab in map)) map[tab] = screen
  }
  return map
})()

const SUPPLIER_SCREEN_TO_TAB_MAP: Partial<Record<Screen, Tab>> = {
  [ROUTES.HOME]: 'home',
  [ROUTES.PROFILE]: 'profile',
  [ROUTES.SETTINGS]: 'profile',
}

const SUPPLIER_TAB_TO_SCREEN_MAP: Partial<Record<Tab, Screen>> = {
  home: ROUTES.HOME,
  profile: ROUTES.PROFILE,
}

export const getTabForScreen = (role: UiRole, screen: Screen): Tab | null => {
  if (role === 'supplier') {
    return SUPPLIER_SCREEN_TO_TAB_MAP[screen] ?? null
  }
  if (isEmployeeRole(role)) {
    if (screen === ROUTES.SHIFTS) return 'activity'
    if (screen === ROUTES.VACANCIES) return 'myshifts'
    if (screen === ROUTES.HOME) return 'feed'
    if (screen === ROUTES.PROFILE || screen === ROUTES.SETTINGS) return 'profile'
  }
  return SCREEN_TO_TAB_MAP[screen]
}

export const getScreenForTab = (role: UiRole, tab: Tab): Screen | null => {
  if (role === 'supplier') {
    return SUPPLIER_TAB_TO_SCREEN_MAP[tab] ?? null
  }

  // Для employee явно направляем "feed" в home экран.
  if (tab === 'feed' && isEmployeeRole(role)) {
    return ROUTES.HOME
  }
  if (tab === 'activity' && isEmployeeRole(role)) {
    return ROUTES.SHIFTS
  }
  if (tab === 'myshifts' && isEmployeeRole(role)) {
    return ROUTES.VACANCIES
  }

  return TAB_TO_SCREEN_MAP[tab] ?? null
}
