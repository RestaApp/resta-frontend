/**
 * Константы для табов Dashboard
 */

import { Building2, Inbox, Package, Search, User, Users, Zap } from 'lucide-react'
import type { Tab, UiRole } from '@/types'
import { isEmployeeRole } from '@/utils/roles'

interface TabItem {
  id: Tab
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

/**
 * Ключи переводов для табов (i18n)
 */
const TAB_LABEL_KEYS = {
  employee: {
    feed: 'tabs.employee.feed',
    activity: 'tabs.employee.activity',
    profile: 'tabs.employee.profile',
  },
  venue: {
    feed: 'tabs.venue.feed',
    activity: 'tabs.venue.activity',
    staff: 'tabs.venue.staff',
    suppliers: 'tabs.venue.suppliers',
    profile: 'tabs.venue.profile',
  },
  supplier: {
    home: 'tabs.supplier.home',
    profile: 'tabs.supplier.profile',
  },
} as const

/**
 * Получает список табов для роли сотрудника (label — ключ i18n)
 */
const getEmployeeTabs = (): TabItem[] => {
  return [
    { id: 'feed', label: TAB_LABEL_KEYS.employee.feed, icon: Search },
    { id: 'activity', label: TAB_LABEL_KEYS.employee.activity, icon: Inbox },
    { id: 'profile', label: TAB_LABEL_KEYS.employee.profile, icon: User },
  ]
}

/**
 * Получает список табов для роли заведения
 */
const getVenueTabs = (): TabItem[] => {
  return [
    { id: 'activity', label: TAB_LABEL_KEYS.venue.activity, icon: Zap },
    { id: 'staff', label: TAB_LABEL_KEYS.venue.staff, icon: Users },
    { id: 'suppliers', label: TAB_LABEL_KEYS.venue.suppliers, icon: Package },
    { id: 'profile', label: TAB_LABEL_KEYS.venue.profile, icon: User },
  ]
}

/**
 * Получает список табов для роли поставщика
 */
const getSupplierTabs = (): TabItem[] => {
  return [
    { id: 'home', label: TAB_LABEL_KEYS.supplier.home, icon: Building2 },
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
