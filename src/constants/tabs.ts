/**
 * Константы для табов Dashboard
 */

import { Home, Zap, Package, User, Users, Store, Search } from 'lucide-react'
import type { Tab, UiRole } from '@/types'
import { isEmployeeRole } from '@/utils/roles'

export interface TabItem {
  id: Tab
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

/**
 * Ключи переводов для табов (i18n)
 */
export const TAB_LABEL_KEYS = {
  employee: {
    feed: 'tabs.employee.feed',
    activity: 'tabs.employee.activity',
    profile: 'tabs.employee.profile',
  },
  venue: {
    home: 'tabs.venue.home',
    staff: 'tabs.venue.staff',
    suppliers: 'tabs.venue.suppliers',
    profile: 'tabs.venue.profile',
  },
  supplier: {
    home: 'tabs.supplier.home',
    requests: 'tabs.supplier.requests',
    showcase: 'tabs.supplier.showcase',
    profile: 'tabs.supplier.profile',
  },
} as const

/**
 * Получает список табов для роли сотрудника (label — ключ i18n)
 */
export const getEmployeeTabs = (): TabItem[] => {
  return [
    { id: 'feed', label: TAB_LABEL_KEYS.employee.feed, icon: Search },
    { id: 'activity', label: TAB_LABEL_KEYS.employee.activity, icon: Zap },
    { id: 'profile', label: TAB_LABEL_KEYS.employee.profile, icon: User },
  ]
}

/**
 * Получает список табов для роли заведения
 */
export const getVenueTabs = (): TabItem[] => {
  return [
    { id: 'home', label: TAB_LABEL_KEYS.venue.home, icon: Home },
    { id: 'staff', label: TAB_LABEL_KEYS.venue.staff, icon: Users },
    { id: 'suppliers', label: TAB_LABEL_KEYS.venue.suppliers, icon: Package },
    { id: 'profile', label: TAB_LABEL_KEYS.venue.profile, icon: User },
  ]
}

/**
 * Получает список табов для роли поставщика
 */
export const getSupplierTabs = (): TabItem[] => {
  return [
    { id: 'home', label: TAB_LABEL_KEYS.supplier.home, icon: Home },
    { id: 'requests', label: TAB_LABEL_KEYS.supplier.requests, icon: Zap },
    { id: 'showcase', label: TAB_LABEL_KEYS.supplier.showcase, icon: Store },
    { id: 'profile', label: TAB_LABEL_KEYS.supplier.profile, icon: User },
  ]
}

/**
 * Получает список табов на основе роли пользователя
 */
export const getTabsForRole = (role: UiRole): TabItem[] => {
  switch (true) {
    case isEmployeeRole(role):
      return getEmployeeTabs()
    case role === 'venue':
      return getVenueTabs()
    case role === 'supplier':
      return getSupplierTabs()
    default:
      return getEmployeeTabs()
  }
}
