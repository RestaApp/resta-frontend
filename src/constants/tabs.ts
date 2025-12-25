/**
 * Константы для табов Dashboard
 */

import { Home, Zap, Package, User, Users, Store, Search } from 'lucide-react'
import type { Tab, UserRole } from '../types'
import { isEmployeeRole } from '../utils/roles'

export interface TabItem {
  id: Tab
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

/**
 * Получает список табов для роли сотрудника
 */
export const getEmployeeTabs = (): TabItem[] => {
  return [
    { id: 'feed', label: 'Поиск', icon: Search },
    { id: 'activity', label: 'Активность', icon: Zap },
    { id: 'profile', label: 'Профиль', icon: User },
  ]
}

/**
 * Получает список табов для роли заведения
 */
export const getVenueTabs = (): TabItem[] => {
  return [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'staff', label: 'Кадры', icon: Users },
    { id: 'suppliers', label: 'Поставщики', icon: Package },
    { id: 'profile', label: 'Профиль', icon: User },
  ]
}

/**
 * Получает список табов для роли поставщика
 */
export const getSupplierTabs = (): TabItem[] => {
  return [
    { id: 'home', label: 'Дашборд', icon: Home },
    { id: 'requests', label: 'Запросы', icon: Zap },
    { id: 'showcase', label: 'Витрина', icon: Store },
    { id: 'profile', label: 'Профиль', icon: User },
  ]
}

/**
 * Получает список табов на основе роли пользователя
 */
export const getTabsForRole = (role: UserRole): TabItem[] => {
  if (isEmployeeRole(role)) {
    return getEmployeeTabs()
  }

  if (role === 'venue') {
    return getVenueTabs()
  }

  if (role === 'supplier') {
    return getSupplierTabs()
  }

  // По умолчанию возвращаем табы для сотрудника
  return getEmployeeTabs()
}

