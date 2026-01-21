// Реэкспорт типов ролей для обратной совместимости
export type {
  UiRole,
  EmployeeRole,
  ApiRole,
  RoleOption,
  EmployeeSubRole,
  RoleOptionApi,
  EmployeeSubRoleApi,
} from '@/shared/types/roles.types'

export { UI_ROLE_TO_API_ROLE } from '@/shared/types/roles.types'

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
