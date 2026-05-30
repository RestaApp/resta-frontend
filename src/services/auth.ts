/**
 * Сервис для работы с аутентификацией
 */

import { STORAGE_KEYS } from '@/shared/constants/storage'
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
} from '@/shared/utils/localStorage'

const TOKEN_STORAGE_KEY = STORAGE_KEYS.AUTH_TOKEN
const REFRESH_TOKEN_STORAGE_KEY = STORAGE_KEYS.REFRESH_TOKEN

const migrateFromSessionStorage = (key: string): void => {
  if (typeof window === 'undefined') return
  try {
    const sessionValue = window.sessionStorage.getItem(key)
    if (sessionValue) {
      setLocalStorageItem(key, sessionValue)
      window.sessionStorage.removeItem(key)
    }
  } catch {
    /* ignore */
  }
}

const getToken = (): string | null => {
  migrateFromSessionStorage(TOKEN_STORAGE_KEY)
  return getLocalStorageItem(TOKEN_STORAGE_KEY)
}

const setToken = (token: string): void => {
  setLocalStorageItem(TOKEN_STORAGE_KEY, token)
}

const getRefreshToken = (): string | null => {
  migrateFromSessionStorage(REFRESH_TOKEN_STORAGE_KEY)
  return getLocalStorageItem(REFRESH_TOKEN_STORAGE_KEY)
}

const setRefreshToken = (token: string): void => {
  setLocalStorageItem(REFRESH_TOKEN_STORAGE_KEY, token)
}

const removeToken = (): void => {
  removeLocalStorageItem(TOKEN_STORAGE_KEY)
}

const removeRefreshToken = (): void => {
  removeLocalStorageItem(REFRESH_TOKEN_STORAGE_KEY)
}

const setTokens = (accessToken: string, refreshToken: string): void => {
  setToken(accessToken)
  setRefreshToken(refreshToken)
}

/**
 * Выполняет выход (очищает все токены и данные пользователя)
 */
const logout = (): void => {
  removeToken()
  removeRefreshToken()
  // Очищаем данные пользователя из Redux
  // Примечание: dispatch должен вызываться из компонента или хука
  // Здесь только очищаем токены, Redux очищается через clearUserData action
}

/**
 * Декодирует JWT токен и возвращает payload
 */
const decodeToken = (
  token: string
): { exp?: number; id?: number; sub?: number; userId?: number; [key: string]: unknown } | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as {
      exp?: number
      id?: number
      sub?: number
      userId?: number
      [key: string]: unknown
    }
  } catch {
    return null
  }
}

/**
 * Получает id пользователя из токена
 */
const getUserIdFromToken = (token: string | null): number | null => {
  if (!token) {
    return null
  }
  const decoded = decodeToken(token)
  if (!decoded) {
    return null
  }
  // Пробуем получить id из разных возможных полей
  return (decoded.id ?? decoded.sub ?? decoded.userId ?? null) as number | null
}

/**
 * Проверяет, истек ли токен
 */
const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true
  }

  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) {
    return true
  }

  // exp - это timestamp в секундах, Date.now() - в миллисекундах
  const expirationTime = decoded.exp * 1000
  const currentTime = Date.now()

  // Добавляем небольшой запас (5 секунд) для учета задержек сети
  return currentTime >= expirationTime - 5000
}

/**
 * Проверяет, валиден ли токен (существует и не истек)
 */
const isTokenValid = (): boolean => {
  const token = getToken()
  return token !== null && !isTokenExpired(token)
}

/**
 * Проверяет, авторизован ли пользователь
 */
const isAuthenticated = (): boolean => {
  return isTokenValid()
}

export const authService = {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  setTokens,
  removeToken,
  removeRefreshToken,
  logout,
  isAuthenticated,
  isTokenExpired,
  isTokenValid,
  decodeToken,
  getUserIdFromToken,
}
