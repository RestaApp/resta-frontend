import type { UserRole } from '../types'

const ROLE_STORAGE_KEY = 'user_role'

const VALID_ROLES: readonly UserRole[] = [
  'chef',
  'waiter',
  'bartender',
  'barista',
  'admin',
  'venue',
  'supplier',
] as const

export function getStoredRole(): UserRole | null {
  const role = localStorage.getItem(ROLE_STORAGE_KEY)
  if (role && VALID_ROLES.includes(role as UserRole)) {
    return role as UserRole
  }
  return null
}

export function setStoredRole(role: UserRole): void {
  localStorage.setItem(ROLE_STORAGE_KEY, role)
}
