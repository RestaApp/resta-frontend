export type UiRole =
  | 'chef'
  | 'waiter'
  | 'bartender'
  | 'barista'
  | 'delivery'
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
  | 'delivery'
  | 'admin'
  | 'manager'
  | 'support'

export type ApiRole = 'employee' | 'supplier' | 'restaurant' | 'unverified'

export const UI_ROLE_TO_API_ROLE: Record<UiRole, ApiRole> = {
  chef: 'employee',
  waiter: 'employee',
  bartender: 'employee',
  barista: 'employee',
  delivery: 'employee',
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
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export interface EmployeeSubRole {
  id: EmployeeRole
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  originalValue?: string
}

export interface RoleOptionApi {
  id: UiRole
  title: string
  description: string
  icon_name?: string
  color: string
}

export interface EmployeeSubRoleApi {
  id: EmployeeRole
  title: string
  description: string
  icon_name?: string
  color: string
}
