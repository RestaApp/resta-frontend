import type { UiRole } from '@/types'
import { STORAGE_KEYS } from '@/constants/storage'
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from './localStorage'

const ROLE_STORAGE_KEY = STORAGE_KEYS.USER_ROLE

const VALID_ROLES: readonly UiRole[] = [
  'chef',
  'waiter',
  'bartender',
  'barista',
  'admin',
  'manager',
  'support',
  'venue',
  'supplier',
] as const

export const getStoredRole = (): UiRole | null => {
  const role = getLocalStorageItem(ROLE_STORAGE_KEY)
  return role && VALID_ROLES.includes(role as UiRole) ? (role as UiRole) : null
}

export const setStoredRole = (role: UiRole): void => setLocalStorageItem(ROLE_STORAGE_KEY, role)
export const removeStoredRole = (): void => removeLocalStorageItem(ROLE_STORAGE_KEY)