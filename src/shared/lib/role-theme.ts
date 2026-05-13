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
    /** focus на полях ввода: рамка и ring вместо глобального `primary` */
    inputFocus: string
    /** hover для сплошной CTA поверх `bg` (перебивает `hover:bg-primary/8` у ghost) */
    solidHover: string
    /** Карточка смены в ленте: 135° как в wireframe (accent-soft → surface). */
    shiftCardGradient: string
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
      inputFocus:
        'focus-visible:border-role-employee focus-visible:ring-role-employee/25 dark:focus-visible:ring-role-employee/30',
      solidHover: 'hover:bg-role-employee/92 active:bg-role-employee/85',
      shiftCardGradient: 'bg-gradient-to-br from-role-employee-soft to-card',
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
      inputFocus:
        'focus-visible:border-role-restaurant focus-visible:ring-role-restaurant/25 dark:focus-visible:ring-role-restaurant/30',
      solidHover: 'hover:bg-role-restaurant/92 active:bg-role-restaurant/85',
      shiftCardGradient: 'bg-gradient-to-br from-role-restaurant-soft to-card',
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
      inputFocus:
        'focus-visible:border-role-supplier focus-visible:ring-role-supplier/25 dark:focus-visible:ring-role-supplier/30',
      solidHover: 'hover:bg-role-supplier/92 active:bg-role-supplier/85',
      shiftCardGradient: 'bg-gradient-to-br from-role-supplier-soft to-card',
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

/** Классы Tailwind для кругового спиннера (Loader и аналоги). */
export const ROLE_LOADER_CLASSES: Record<
  RoleKind,
  { track: string; borderTop: string; borderRight: string }
> = {
  employee: {
    track: 'border-role-employee/20',
    borderTop: 'border-t-role-employee',
    borderRight: 'border-r-role-employee',
  },
  restaurant: {
    track: 'border-role-restaurant/20',
    borderTop: 'border-t-role-restaurant',
    borderRight: 'border-r-role-restaurant',
  },
  supplier: {
    track: 'border-role-supplier/20',
    borderTop: 'border-t-role-supplier',
    borderRight: 'border-r-role-supplier',
  },
}

export function getRoleLoaderClasses(role: UiRole | ApiRole) {
  return ROLE_LOADER_CLASSES[getRoleKind(role)]
}
