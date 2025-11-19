/**
 * Константы маршрутов приложения
 */

import type { Screen } from '../types'

export const ROUTES = {
  HOME: 'home',
  SHIFTS: 'shifts',
  VACANCIES: 'vacancies',
  PROFILE: 'profile',
  NOTIFICATIONS: 'notifications',
  CREATE_SHIFT: 'create-shift',
  SETTINGS: 'settings',
  SUPPLIERS: 'suppliers',
  FIND_REPLACEMENT: 'find-replacement',
  WORK_MANAGEMENT: 'work-management',
  APPLICATIONS: 'applications',
} as const satisfies Record<string, Screen>

export const VALID_SCREENS: readonly Screen[] = [
  ROUTES.SHIFTS,
  ROUTES.VACANCIES,
  ROUTES.CREATE_SHIFT,
  ROUTES.SETTINGS,
  ROUTES.SUPPLIERS,
  ROUTES.FIND_REPLACEMENT,
  ROUTES.WORK_MANAGEMENT,
  ROUTES.NOTIFICATIONS,
  ROUTES.APPLICATIONS,
] as const
