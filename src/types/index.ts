/**
 * Централизованные типы приложения
 */

export type UserRole = 'chef' | 'waiter' | 'bartender' | 'barista' | 'admin' | 'venue' | 'supplier' | 'unverified'

export type EmployeeRole = 'chef' | 'waiter' | 'bartender' | 'barista' | 'admin'

export type Tab = 'home' | 'shifts' | 'notifications' | 'profile' | 'vacancies'

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
  id: UserRole
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
}
