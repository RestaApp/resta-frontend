export type UiRole =
  | 'chef'
  | 'waiter'
  | 'bartender'
  | 'barista'
  | 'hostess'
  | 'delivery'
  | 'cashier'
  | 'office'
  | 'admin'
  | 'manager'
  | 'support'
  | 'venue'
  | 'supplier'

export type EmployeeRole =
  | 'chef'
  | 'waiter'
  | 'bartender'
  | 'barista'
  | 'hostess'
  | 'delivery'
  | 'cashier'
  | 'office'
  | 'admin'
  | 'manager'
  | 'support'

export type ApiRole = 'employee' | 'supplier' | 'restaurant' | 'unverified'

/** Категория аккаунта для копирайта онбординга (не цветовая тема). */
export type RoleCategory = 'employee' | 'restaurant' | 'supplier'

export function getRoleCategory(role: UiRole | ApiRole): RoleCategory {
  const apiRole = (
    role in UI_ROLE_TO_API_ROLE ? UI_ROLE_TO_API_ROLE[role as UiRole] : role
  ) as ApiRole
  if (apiRole === 'restaurant') return 'restaurant'
  if (apiRole === 'supplier') return 'supplier'
  return 'employee'
}

export const UI_ROLE_TO_API_ROLE: Record<UiRole, ApiRole> = {
  chef: 'employee',
  waiter: 'employee',
  bartender: 'employee',
  barista: 'employee',
  hostess: 'employee',
  delivery: 'employee',
  cashier: 'employee',
  office: 'employee',
  admin: 'employee',
  manager: 'employee',
  support: 'employee',
  supplier: 'supplier',
  venue: 'restaurant',
}

export interface RoleOption {
  id: UiRole
  title: string
  description: string
}

export interface EmployeeSubRole {
  id: EmployeeRole
  title: string
  description: string
  originalValue?: string
}
