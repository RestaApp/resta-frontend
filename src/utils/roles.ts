/**
 * Утилиты для работы с ролями
 */

import type { UserRole, EmployeeRole } from '../types'
import { EMPLOYEE_ROLES } from '../constants/roles'

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
