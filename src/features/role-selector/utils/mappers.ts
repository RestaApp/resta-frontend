import type { RoleOption, EmployeeSubRole, UiRole, EmployeeRole } from '@/shared/types/roles.types'
import {
  mapApiRoleStringToUiRole,
  mapPositionFromApi as mapPositionToEmployeeRole,
} from '@/utils/roles'
import i18n from '@/shared/i18n/config'

const tRoleLabel = (roleId: UiRole): string =>
  i18n.t(`roles.labels.${roleId}`, { defaultValue: roleId })

const tRoleDescription = (roleId: UiRole): string =>
  i18n.t(`roles.descriptions.${roleId}`, { defaultValue: '' })

const tPositionLabel = (positionId: EmployeeRole): string => {
  const key = `labels.position.${positionId}`
  const translated = i18n.t(key)
  if (translated && translated !== key) return translated
  return i18n.t(`roles.labels.${positionId}`, { defaultValue: positionId })
}

const tPositionDescription = (positionId: EmployeeRole): string =>
  i18n.t(`roles.descriptions.${positionId}`, { defaultValue: '' })

const mapRoleOptionFromApi = (roleValue: string): RoleOption | null => {
  const roleId = mapApiRoleStringToUiRole(roleValue)
  if (!roleId) return null

  return {
    id: roleId,
    title: tRoleLabel(roleId),
    description: tRoleDescription(roleId),
  }
}

export const mapRoleOptionsFromApi = (rolesApi: string[]): RoleOption[] =>
  rolesApi.map(mapRoleOptionFromApi).filter((r): r is RoleOption => r !== null)

const mapPositionFromApi = (positionValue: string): EmployeeSubRole | null => {
  const roleId = mapPositionToEmployeeRole(positionValue)
  if (!roleId) return null

  return {
    id: roleId,
    title: tPositionLabel(roleId),
    description: tPositionDescription(roleId) || tRoleDescription(roleId),
    originalValue: positionValue.toLowerCase().trim(),
  }
}

export const mapEmployeeSubRolesFromApi = (positionsApi: string[]): EmployeeSubRole[] =>
  positionsApi.map(mapPositionFromApi).filter((r): r is EmployeeSubRole => r !== null)
