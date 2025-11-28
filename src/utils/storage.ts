import type { UserRole } from '../types'
import { STORAGE_KEYS } from '../constants/storage'

const ROLE_STORAGE_KEY = STORAGE_KEYS.USER_ROLE

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

export function removeStoredRole(): void {
  localStorage.removeItem(ROLE_STORAGE_KEY)
}
