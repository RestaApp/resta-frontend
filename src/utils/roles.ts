/**
 * Утилиты для работы с ролями
 */

import type { UserRole, EmployeeRole } from '../types'
import { EMPLOYEE_ROLES } from '../constants/roles'

/**
 * Маппинг роли из API (строка) в UserRole
 * API может возвращать: 'unverified', 'employee', 'restaurant', 'supplier', 'chef', 'waiter', 'bartender', 'barista', 'admin', 'venue'
 */
export const mapRoleFromApi = (roleString: string | null | undefined): UserRole | null => {
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
    manager: 'manager',
    support: 'support',
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
  return null
}

/**
 * Проверяет, является ли роль ролью сотрудника
 */
export const isEmployeeRole = (role: UserRole | null): role is EmployeeRole => {
  if (!role) return false
  return EMPLOYEE_ROLES.includes(role as EmployeeRole)
}

/**
 * Проверяет, является ли роль ролью заведения
 */
export const isVenueRole = (role: UserRole | null): boolean => {
  return role === 'venue'
}

/**
 * Проверяет, является ли роль ролью поставщика
 */
export const isSupplierRole = (role: UserRole | null): boolean => {
  return role === 'supplier'
}

/**
 * Проверяет, может ли роль просматривать смены
 */
export const canViewShifts = (role: UserRole | null): boolean => {
  return isEmployeeRole(role) || isVenueRole(role)
}

/**
 * Проверяет, является ли роль unverified (не подтвержденной)
 * Принимает либо строку роли из API, либо уже маппленную роль UserRole
 */
export const isUnverifiedRole = (role: string | null | undefined | UserRole): boolean => {
  if (!role) {
    return true // null/undefined считается unverified
  }

  // Маппим роль (mapRoleFromApi умеет работать и со строками из API, и с уже маппленными ролями)
  const mappedRole = mapRoleFromApi(role)
  return !mappedRole || mappedRole === 'unverified'
}

/**
 * Проверяет, является ли роль подтвержденной (не unverified)
 * Обратная функция к isUnverifiedRole
 */
export const isVerifiedRole = (role: string | null | undefined | UserRole): boolean => {
  return !isUnverifiedRole(role)
}
