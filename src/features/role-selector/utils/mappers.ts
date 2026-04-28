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
  mapApiRoleStringToUiRole,
  mapPositionFromApi as mapPositionToEmployeeRole,
} from '@/utils/roles'
import i18n from '@/shared/i18n/config'

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

const tRoleLabel = (roleId: UiRole): string =>
  i18n.t(`roles.labels.${roleId}`, { defaultValue: roleId })

const tRoleDescription = (roleId: UiRole): string =>
  i18n.t(`roles.descriptions.${roleId}`, { defaultValue: '' })

const tPositionLabel = (positionId: EmployeeRole): string =>
  i18n.t(`roles.labels.${positionId}`, { defaultValue: positionId })

const tPositionDescription = (positionId: EmployeeRole): string =>
  i18n.t(`roles.descriptions.${positionId}`, { defaultValue: '' })

const mapRoleOptionFromApi = (roleValue: string): RoleOption | null => {
  const roleId = mapApiRoleStringToUiRole(roleValue)
  if (!roleId) return null

  return {
    id: roleId,
    title: tRoleLabel(roleId),
    description: tRoleDescription(roleId),
    icon: ROLE_ICON_MAP[roleId],
    color: ROLE_COLOR_MAP[roleId],
  }
}

export const mapRoleOptionsFromApi = (rolesApi: string[]): RoleOption[] =>
  rolesApi.map(mapRoleOptionFromApi).filter((r): r is RoleOption => r !== null)

const mapPositionFromApi = (positionValue: string): EmployeeSubRole | null => {
  const roleId = mapPositionToEmployeeRole(positionValue)
  if (!roleId) return null

  const icon = POSITION_ICON_MAP[roleId] ?? ROLE_ICON_MAP[roleId]
  const color = POSITION_COLOR_MAP[roleId] ?? ROLE_COLOR_MAP[roleId]

  return {
    id: roleId,
    title: tPositionLabel(roleId),
    description: tPositionDescription(roleId) || tRoleDescription(roleId),
    icon,
    color,
    originalValue: positionValue.toLowerCase().trim(),
  }
}

export const mapEmployeeSubRolesFromApi = (positionsApi: string[]): EmployeeSubRole[] =>
  positionsApi.map(mapPositionFromApi).filter((r): r is EmployeeSubRole => r !== null)
