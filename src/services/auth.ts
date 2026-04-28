/**
 * Сервис для работы с аутентификацией
 */

import { STORAGE_KEYS } from '@/constants/storage'
import { getLocalStorageItem, removeLocalStorageItem } from '@/utils/localStorage'

const TOKEN_STORAGE_KEY = STORAGE_KEYS.AUTH_TOKEN
const REFRESH_TOKEN_STORAGE_KEY = STORAGE_KEYS.REFRESH_TOKEN

const getSessionStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

const setSessionStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    void 0
  }
}

const removeSessionStorageItem = (key: string): void => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    void 0
  }
}

/**
 * Получает токен авторизации
 */
const getToken = (): string | null => {
  const sessionToken = getSessionStorageItem(TOKEN_STORAGE_KEY)
  if (sessionToken) return sessionToken

  // Legacy migration: переносим токен из localStorage в sessionStorage при первом чтении.
  const legacyToken = getLocalStorageItem(TOKEN_STORAGE_KEY)
  if (legacyToken) {
    setSessionStorageItem(TOKEN_STORAGE_KEY, legacyToken)
    removeLocalStorageItem(TOKEN_STORAGE_KEY)
  }

  return legacyToken
}

/**
 * Сохраняет токен авторизации
 */
const setToken = (token: string): void => {
  setSessionStorageItem(TOKEN_STORAGE_KEY, token)
  removeLocalStorageItem(TOKEN_STORAGE_KEY)
}

/**
 * Получает refresh токен
 */
const getRefreshToken = (): string | null => {
  const sessionToken = getSessionStorageItem(REFRESH_TOKEN_STORAGE_KEY)
  if (sessionToken) return sessionToken

  // Legacy migration: переносим refresh токен из localStorage в sessionStorage при первом чтении.
  const legacyToken = getLocalStorageItem(REFRESH_TOKEN_STORAGE_KEY)
  if (legacyToken) {
    setSessionStorageItem(REFRESH_TOKEN_STORAGE_KEY, legacyToken)
    removeLocalStorageItem(REFRESH_TOKEN_STORAGE_KEY)
  }

  return legacyToken
}

/**
 * Сохраняет refresh токен
 */
const setRefreshToken = (token: string): void => {
  setSessionStorageItem(REFRESH_TOKEN_STORAGE_KEY, token)
  removeLocalStorageItem(REFRESH_TOKEN_STORAGE_KEY)
}

/**
 * Удаляет токен авторизации
 */
const removeToken = (): void => {
  removeSessionStorageItem(TOKEN_STORAGE_KEY)
  removeLocalStorageItem(TOKEN_STORAGE_KEY)
}

/**
 * Удаляет refresh токен
 */
const removeRefreshToken = (): void => {
  removeSessionStorageItem(REFRESH_TOKEN_STORAGE_KEY)
  removeLocalStorageItem(REFRESH_TOKEN_STORAGE_KEY)
}

/**
 * Сохраняет оба токена
 */
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
