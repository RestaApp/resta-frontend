import type { ApiRole, UiRole } from '@/shared/types/roles.types'
import { UI_ROLE_TO_API_ROLE } from '@/shared/types/roles.types'

export type RoleKind = 'employee' | 'restaurant' | 'supplier'

export interface RoleTheme {
  /** CSS variable name (без var()), напр. `--role-employee` */
  cssVar: string
  /** Tailwind utility classes, привязанные к палитре роли. */
  classes: {
    bg: string
    bgSoft: string
    bgSurface: string
    text: string
    textOn: string
    border: string
    ring: string
  }
}

export const ROLE_THEME: Record<RoleKind, RoleTheme> = {
  employee: {
    cssVar: '--role-employee',
    classes: {
      bg: 'bg-role-employee',
      bgSoft: 'bg-role-employee-soft',
      bgSurface: 'bg-role-employee-surface',
      text: 'text-role-employee',
      textOn: 'text-role-employee-foreground',
      border: 'border-role-employee',
      ring: 'ring-role-employee',
    },
  },
  restaurant: {
    cssVar: '--role-restaurant',
    classes: {
      bg: 'bg-role-restaurant',
      bgSoft: 'bg-role-restaurant-soft',
      bgSurface: 'bg-role-restaurant-surface',
      text: 'text-role-restaurant',
      textOn: 'text-role-restaurant-foreground',
      border: 'border-role-restaurant',
      ring: 'ring-role-restaurant',
    },
  },
  supplier: {
    cssVar: '--role-supplier',
    classes: {
      bg: 'bg-role-supplier',
      bgSoft: 'bg-role-supplier-soft',
      bgSurface: 'bg-role-supplier-surface',
      text: 'text-role-supplier',
      textOn: 'text-role-supplier-foreground',
      border: 'border-role-supplier',
      ring: 'ring-role-supplier',
    },
  },
}

export function getRoleKind(role: UiRole | ApiRole): RoleKind {
  const apiRole = (role in UI_ROLE_TO_API_ROLE
    ? UI_ROLE_TO_API_ROLE[role as UiRole]
    : role) as ApiRole
  return apiRole === 'restaurant' ? 'restaurant' : apiRole === 'supplier' ? 'supplier' : 'employee'
}

export function getRoleTheme(role: UiRole | ApiRole): RoleTheme {
  return ROLE_THEME[getRoleKind(role)]
}
