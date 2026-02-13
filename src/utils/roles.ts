// utils/roles.ts
import type { ApiRole, UiRole, EmployeeRole } from '@/shared/types/roles.types'
import { UI_ROLE_TO_API_ROLE } from '@/shared/types/roles.types'

/**
 * Список позиций сотрудников для проверки и маппинга
 */
const EMPLOYEE_POSITIONS = [
  'chef',
  'waiter',
  'bartender',
  'barista',
  'delivery',
  'admin',
  'manager',
  'support',
] as const
const EMPLOYEE_POSITIONS_SET = new Set(EMPLOYEE_POSITIONS)

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

  if (EMPLOYEE_POSITIONS_SET.has(r as (typeof EMPLOYEE_POSITIONS)[number])) return 'employee'

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

export const isVerifiedRole = (role: ApiRole | null | undefined): boolean => !isUnverifiedRole(role)

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
    role === 'delivery' ||
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
  const r = normalizeRole(roleValue)

  if (r === 'restaurant' || r === 'venue') return 'venue'
  if (r === 'supplier') return 'supplier'
  if (r === 'employee') return 'chef'

  const map: Record<string, UiRole> = {
    chef: 'chef',
    waiter: 'waiter',
    bartender: 'bartender',
    barista: 'barista',
    delivery: 'delivery',
    admin: 'admin',
    manager: 'manager',
    support: 'support',
  }

  return map[r] || null
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
    delivery: 'delivery',
    admin: 'admin',
    manager: 'manager',
    support: 'support',
  }
  return employeeRolesMap[normalized] || null
}

/**
 * Нормализатор позиции сотрудника из API -> ключ UI
 * Возвращает нормализованный ключ EmployeeRole или null
 */
export const normalizeEmployeePosition = (value: string): EmployeeRole | null => {
  return mapPositionFromApi(value)
}
