/**
 * Константы для навигации и синхронизации табов
 */

import type { Screen, Tab } from '@/types'
import { ROUTES } from './routes'

/**
 * Маппинг экранов на табы для синхронизации
 */
export const SCREEN_TO_TAB_MAP: Record<Screen, Tab | null> = {
  [ROUTES.HOME]: 'feed',
  [ROUTES.SHIFTS]: null,
  [ROUTES.VACANCIES]: null,
  [ROUTES.NOTIFICATIONS]: null,
  [ROUTES.PROFILE]: 'profile',
  [ROUTES.SETTINGS]: 'profile',
  [ROUTES.CREATE_SHIFT]: null,
  [ROUTES.SUPPLIERS]: null,
  [ROUTES.FIND_REPLACEMENT]: null,
  [ROUTES.WORK_MANAGEMENT]: null,
  [ROUTES.APPLICATIONS]: null,
} as const

/** Обратный маппинг: таб → первый экран (для onNavigate при смене таба) */
export const TAB_TO_SCREEN_MAP: Partial<Record<Tab, Screen>> = (() => {
  const map: Partial<Record<Tab, Screen>> = {}
  for (const [screen, tab] of Object.entries(SCREEN_TO_TAB_MAP) as [Screen, Tab | null][]) {
    if (tab != null && !(tab in map)) map[tab] = screen
  }
  return map
})()
