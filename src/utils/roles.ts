/**
 * Утилиты для работы с ролями
 */

import type { UserRole, EmployeeRole } from '../types'
import { EMPLOYEE_ROLES } from '../constants/roles'

/**
 * Маппинг роли из API (строка) в UserRole
 * API может возвращать: 'unverified', 'employee', 'restaurant', 'supplier', 'chef', 'waiter', 'bartender', 'barista', 'admin', 'venue'
 */
export function mapRoleFromApi(roleString: string | null | undefined): UserRole | null {
  if (!roleString) {
    return null
  }

  const normalizedRole = roleString.toLowerCase().trim()

  // Прямое соответствие
  const directMap: Record<string, UserRole> = {
    unverified: 'unverified',
    chef: 'chef',
    waiter: 'waiter',
    bartender: 'bartender',
    barista: 'barista',
    admin: 'admin',
    venue: 'venue',
    supplier: 'supplier',
  }

  if (directMap[normalizedRole]) {
    return directMap[normalizedRole]
  }

  // Маппинг из API формата
  const apiMap: Record<string, UserRole> = {
    employee: 'chef', // employee -> chef (для сотрудников)
    restaurant: 'venue', // restaurant -> venue (для заведения)
  }

  if (apiMap[normalizedRole]) {
    return apiMap[normalizedRole]
  }

  // Если роль не распознана, возвращаем null
  console.warn('Неизвестная роль из API:', roleString)
  return null
}

/**
 * Проверяет, является ли роль ролью сотрудника
 */
export function isEmployeeRole(role: UserRole | null): role is EmployeeRole {
  if (!role) return false
  return EMPLOYEE_ROLES.includes(role as EmployeeRole)
}

/**
 * Проверяет, является ли роль ролью заведения
 */
export function isVenueRole(role: UserRole | null): boolean {
  return role === 'venue'
}

/**
 * Проверяет, является ли роль ролью поставщика
 */
export function isSupplierRole(role: UserRole | null): boolean {
  return role === 'supplier'
}

/**
 * Проверяет, может ли роль просматривать смены
 */
export function canViewShifts(role: UserRole | null): boolean {
  return isEmployeeRole(role) || isVenueRole(role)
}
