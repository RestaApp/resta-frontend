export type UiRole =
  | 'chef'
  | 'waiter'
  | 'bartender'
  | 'barista'
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
  | 'admin'
  | 'manager'
  | 'support'

export type ApiRole = 'employee' | 'supplier' | 'restaurant' | 'unverified'

export const UI_ROLE_TO_API_ROLE: Record<UiRole, ApiRole> = {
  chef: 'employee',
  waiter: 'employee',
  bartender: 'employee',
  barista: 'employee',
  admin: 'employee',
  manager: 'employee',
  support: 'employee',
  supplier: 'supplier',
  venue: 'restaurant',
}

export type Tab =
  | 'home'
  | 'shifts'
  | 'notifications'
  | 'profile'
  | 'vacancies'
  | 'exchange'
  | 'suppliers'
  | 'myshifts'
  | 'staff'
  | 'requests'
  | 'showcase'
  | 'feed'
  | 'activity'

export type Screen =
  | 'home'
  | 'shifts'
  | 'vacancies'
  | 'profile'
  | 'notifications'
  | 'create-shift'
  | 'settings'
  | 'suppliers'
  | 'find-replacement'
  | 'work-management'
  | 'applications'

export interface NavigationHandler {
  navigate: (destination: Screen) => void
  back: () => void
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