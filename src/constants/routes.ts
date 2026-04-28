/**
 * Константы маршрутов приложения
 */

import type { Screen } from '@/types'

export const ROUTES = {
  LOADING: 'loading',
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
