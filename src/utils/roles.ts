// utils/roles.ts
import type { ApiRole, UiRole, EmployeeRole } from '@/shared/types/roles.types'
import { UI_ROLE_TO_API_ROLE } from '@/shared/types/roles.types'

/**
 * Список позиций сотрудников для проверки и маппинга
 */
const EMPLOYEE_POSITIONS = ['chef', 'waiter', 'bartender', 'barista', 'admin', 'manager', 'support'] as const

/**
 * Нормализация строки роли (из API / legacy)
 */
export const normalizeRole = (value: unknown): string =>
  typeof value === 'string' ? value.toLowerCase().trim() : ''

/**
 * Привести любую входящую строку к ApiRole.
 * Поддержка legacy:
 * - venue -> restaurant
 * - chef/waiter/... -> employee
 */
export const mapRoleFromApi = (roleString: unknown): ApiRole => {
  const r = normalizeRole(roleString)

  if (r === 'employee') return 'employee'
  if (r === 'restaurant') return 'restaurant'
  if (r === 'supplier') return 'supplier'
  if (r === 'unverified') return 'unverified'

  if (r === 'venue') return 'restaurant'

  const employeePositionsSet = new Set(EMPLOYEE_POSITIONS)
  if (employeePositionsSet.has(r as (typeof EMPLOYEE_POSITIONS)[number])) return 'employee'

  return 'unverified'
}

/**
 * ApiRole -> дефолтная UiRole
 * (используется для авто-выбора UI после sign_in, если роль verified)
 */
export const mapApiRoleToDefaultUiRole = (apiRole: ApiRole): UiRole | null => {
  switch (apiRole) {
    case 'employee':
      return 'chef'
    case 'restaurant':
      return 'venue'
    case 'supplier':
      return 'supplier'
    case 'unverified':
      return null
  }
}

/**
 * UiRole -> ApiRole (единственный правильный способ отправлять роль на сервер)
 */
export const mapUiRoleToApiRole = (uiRole: UiRole): ApiRole => UI_ROLE_TO_API_ROLE[uiRole]

/**
 * Проверки verified/unverified (работают строго на ApiRole)
 */
export const isUnverifiedRole = (role: ApiRole | null | undefined): boolean =>
  !role || role === 'unverified'

export const isVerifiedRole = (role: ApiRole | null | undefined): boolean =>
  !isUnverifiedRole(role)

/**
 * ===== Backward-compatible helpers =====
 * Эти функции часто используются в UI/навигции/табе.
 * Принимают UiRole | null (потому что это выбранная роль в интерфейсе).
 */

export const isEmployeeRole = (role: UiRole | null | undefined): role is EmployeeRole => {
  if (!role) return false
  return (
    role === 'chef' ||
    role === 'waiter' ||
    role === 'bartender' ||
    role === 'barista' ||
    role === 'admin' ||
    role === 'manager' ||
    role === 'support'
  )
}

export const isVenueRole = (role: UiRole | null | undefined): boolean => role === 'venue'
export const isSupplierRole = (role: UiRole | null | undefined): boolean => role === 'supplier'

export const canViewShifts = (role: UiRole | null | undefined): boolean =>
  isEmployeeRole(role) || isVenueRole(role)

/**
 * Преобразует строку из API списка ролей в UI роль
 * Используется при отображении списка доступных ролей
 */
export const mapApiRoleStringToUiRole = (roleValue: string): UiRole | null => {
  const normalized = roleValue.toLowerCase().trim()
  
  // Прямое соответствие
  if (normalized === 'employee') return 'chef'
  if (normalized === 'restaurant') return 'venue'
  if (normalized === 'supplier') return 'supplier'
  
  // Legacy значения
  if (normalized === 'venue') return 'venue'
  if (normalized === 'chef') return 'chef'
  
  // Позиции сотрудников (для обратной совместимости)
  const employeePositionsMap: Record<string, UiRole> = {
    waiter: 'waiter',
    bartender: 'bartender',
    barista: 'barista',
    admin: 'admin',
    manager: 'manager',
    support: 'support',
  }
  
  return employeePositionsMap[normalized] || null
}

/**
 * Преобразует позицию сотрудника из API в EmployeeRole
 */
export const mapPositionFromApi = (positionValue: string): EmployeeRole | null => {
  const normalized = normalizeRole(positionValue)
  const employeeRolesMap: Record<string, EmployeeRole> = {
    chef: 'chef',
    waiter: 'waiter',
    bartender: 'bartender',
    barista: 'barista',
    admin: 'admin',
    manager: 'manager',
    support: 'support',
  }
  return employeeRolesMap[normalized] || null
}
