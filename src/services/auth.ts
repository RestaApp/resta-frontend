/**
 * Сервис для работы с аутентификацией
 */

const TOKEN_STORAGE_KEY = 'auth_token'
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token'

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
 * Выполняет выход (очищает все токены)
 */
export function logout(): void {
  removeToken()
  removeRefreshToken()
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
}
