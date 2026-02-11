import {
  UtensilsCrossed,
  Wine,
  Coffee,
  UserCog,
  Store,
  ChefHat,
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
  manager: 'from-indigo-500 to-blue-600',
  support: 'from-gray-500 to-gray-600',
}

const ROLE_ICON_MAP: Record<UiRole, React.ComponentType<{ className?: string }>> = {
  chef: ChefHat,
  waiter: UtensilsCrossed,
  bartender: Wine,
  barista: Coffee,
  admin: UserCog,
  manager: Briefcase,
  support: Headphones,
  venue: Store,
  supplier: Truck,
}

const ROLE_COLOR_MAP: Record<UiRole, string> = {
  chef: 'from-[#d16b9f] to-[#8b5da8]',
  waiter: 'from-green-500 to-emerald-500',
  bartender: 'from-purple-500 to-pink-500',
  barista: 'from-amber-500 to-orange-500',
  admin: 'from-indigo-500 to-blue-600',
  manager: 'from-indigo-500 to-blue-600',
  support: 'from-gray-500 to-gray-600',
  venue: 'from-[#8b5da8] to-[#6b4c9a]',
  supplier: 'from-[#7ec8e3] to-[#a8d5e2]',
}

const ROLE_DESCRIPTION_MAP: Record<UiRole, string> = {
  chef: 'Ищу смены, работу, развитие',
  waiter: 'Обслуживаю гостей в зале',
  bartender: 'Готовлю напитки и коктейли',
  barista: 'Готовлю кофе и кофейные напитки',
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
