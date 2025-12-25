/**
 * Константы для навигации и синхронизации табов
 */

import type { Screen, Tab } from '../types'
import { ROUTES } from './routes'

/**
 * Маппинг экранов на табы для синхронизации
 */
export const SCREEN_TO_TAB_MAP: Record<Screen, Tab | null> = {
  [ROUTES.HOME]: 'feed',
  [ROUTES.SHIFTS]: 'shifts',
  [ROUTES.VACANCIES]: 'vacancies',
  [ROUTES.NOTIFICATIONS]: 'notifications',
  [ROUTES.PROFILE]: 'profile',
  [ROUTES.SETTINGS]: 'profile', // Settings открывается из профиля
  [ROUTES.CREATE_SHIFT]: null,
  [ROUTES.SUPPLIERS]: null,
  [ROUTES.FIND_REPLACEMENT]: null,
  [ROUTES.WORK_MANAGEMENT]: null,
  [ROUTES.APPLICATIONS]: null,
} as const
