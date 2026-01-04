import type { UserRole } from '../types'
import { STORAGE_KEYS } from '../constants/storage'
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from './localStorage'

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

export const getStoredRole = (): UserRole | null => {
  const role = getLocalStorageItem(ROLE_STORAGE_KEY)
  if (role && VALID_ROLES.includes(role as UserRole)) {
    return role as UserRole
  }
  return null
}

export const setStoredRole = (role: UserRole): void => {
  setLocalStorageItem(ROLE_STORAGE_KEY, role)
}

export const removeStoredRole = (): void => {
  removeLocalStorageItem(ROLE_STORAGE_KEY)
}
