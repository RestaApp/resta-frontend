/**
 * Сервис для работы с аутентификацией
 */

import { STORAGE_KEYS } from '../constants/storage'

const TOKEN_STORAGE_KEY = STORAGE_KEYS.AUTH_TOKEN
const REFRESH_TOKEN_STORAGE_KEY = STORAGE_KEYS.REFRESH_TOKEN

/**
 * Получает токен авторизации
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Сохраняет токен авторизации
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

/**
 * Получает refresh токен
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

/**
 * Сохраняет refresh токен
 */
export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token)
}

/**
 * Удаляет токен авторизации
 */
export function removeToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Удаляет refresh токен
 */
export function removeRefreshToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

/**
 * Сохраняет оба токена
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  setToken(accessToken)
  setRefreshToken(refreshToken)
}

/**
 * Выполняет выход (очищает все токены и данные пользователя)
 */
export function logout(): void {
  removeToken()
  removeRefreshToken()
  // Очищаем данные пользователя из Redux
  // Примечание: dispatch должен вызываться из компонента или хука
  // Здесь только очищаем токены, Redux очищается через clearUserData action
}

/**
 * Декодирует JWT токен и возвращает payload
 */
export function decodeToken(
  token: string
): { exp?: number; id?: number; sub?: number; userId?: number; [key: string]: unknown } | null {
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
export function getUserIdFromToken(token: string | null): number | null {
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
export function isTokenExpired(token: string | null): boolean {
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
export function isTokenValid(): boolean {
  const token = getToken()
  return token !== null && !isTokenExpired(token)
}

/**
 * Проверяет, авторизован ли пользователь
 */
export function isAuthenticated(): boolean {
  return getToken() !== null
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
