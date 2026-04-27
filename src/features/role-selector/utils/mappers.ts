import {
  Utensils,
  Martini,
  Coffee,
  UserCog,
  Store,
  CookingPot,
  Truck,
  Briefcase,
  Headphones,
} from 'lucide-react'
import type { RoleOption, EmployeeSubRole, UiRole, EmployeeRole } from '@/shared/types/roles.types'
import {
  getEmployeePositionLabel,
  getEmployeePositionDescription,
  getUiRoleLabel,
} from '@/constants/labels'
import {
  mapApiRoleStringToUiRole,
  mapPositionFromApi as mapPositionToEmployeeRole,
} from '@/utils/roles'

const POSITION_ICON_MAP: Partial<
  Record<EmployeeRole, React.ComponentType<{ className?: string }>>
> = {
  manager: Briefcase,
  support: Headphones,
}

const POSITION_COLOR_MAP: Partial<Record<EmployeeRole, string>> = {
  manager: 'from-terracotta to-amber',
  support: 'from-muted-foreground to-foreground',
}

const ROLE_ICON_MAP: Record<UiRole, React.ComponentType<{ className?: string }>> = {
  chef: CookingPot,
  waiter: Utensils,
  bartender: Martini,
  barista: Coffee,
  hostess: Utensils,
  delivery: Truck,
  cashier: UserCog,
  office: Headphones,
  admin: UserCog,
  manager: Briefcase,
  support: Headphones,
  venue: Store,
  supplier: Truck,
}

const ROLE_COLOR_MAP: Record<UiRole, string> = {
  chef: 'from-terracotta to-amber',
  waiter: 'from-success to-terracotta',
  bartender: 'from-terracotta to-amber',
  barista: 'from-warning to-terracotta',
  hostess: 'from-success to-terracotta',
  delivery: 'from-terracotta to-success',
  cashier: 'from-terracotta to-amber',
  office: 'from-terracotta to-amber',
  admin: 'from-terracotta to-amber',
  manager: 'from-terracotta to-amber',
  support: 'from-muted-foreground to-foreground',
  venue: 'from-terracotta to-amber',
  supplier: 'from-amber to-terracotta',
}

const ROLE_DESCRIPTION_MAP: Record<UiRole, string> = {
  chef: 'Ищу смены, работу, развитие',
  waiter: 'Обслуживаю гостей в зале',
  bartender: 'Готовлю напитки и коктейли',
  barista: 'Готовлю кофе и кофейные напитки',
  hostess: 'Встречаю гостей и управляю посадкой',
  delivery: 'Доставляю заказы гостям',
  cashier: 'Работаю на кассе и принимаю оплату',
  office: 'Работаю в офисной команде',
  admin: 'Управляю заведением и персоналом',
  manager: 'Управляю командой и процессами',
  support: 'Оказываю поддержку и помощь',
  venue: 'Ищу персонал и поставщиков',
  supplier: 'Предлагаю товары и услуги',
}

export const mapRoleOptionFromApi = (roleValue: string): RoleOption | null => {
  const roleId = mapApiRoleStringToUiRole(roleValue)
  if (!roleId) return null

  return {
    id: roleId,
    title: getUiRoleLabel(roleValue),
    description: ROLE_DESCRIPTION_MAP[roleId],
    icon: ROLE_ICON_MAP[roleId],
    color: ROLE_COLOR_MAP[roleId],
  }
}

export const mapRoleOptionsFromApi = (rolesApi: string[]): RoleOption[] =>
  rolesApi.map(mapRoleOptionFromApi).filter((r): r is RoleOption => r !== null)

export const mapPositionFromApi = (positionValue: string): EmployeeSubRole | null => {
  const roleId = mapPositionToEmployeeRole(positionValue)
  if (!roleId) return null

  const icon = POSITION_ICON_MAP[roleId] ?? ROLE_ICON_MAP[roleId]
  const color = POSITION_COLOR_MAP[roleId] ?? ROLE_COLOR_MAP[roleId]

  return {
    id: roleId,
    title: getEmployeePositionLabel(positionValue),
    description: getEmployeePositionDescription(positionValue) || ROLE_DESCRIPTION_MAP[roleId],
    icon,
    color,
    originalValue: positionValue.toLowerCase().trim(),
  }
}

export const mapEmployeeSubRolesFromApi = (positionsApi: string[]): EmployeeSubRole[] =>
  positionsApi.map(mapPositionFromApi).filter((r): r is EmployeeSubRole => r !== null)
