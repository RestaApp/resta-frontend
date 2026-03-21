import { authService } from '@/services/auth'

/**
 * Разбор ответа POST /api/v1/auth/refresh (API.md: только Authorization Bearer).
 * Поддерживаются форматы: meta.token (как sign_in), accessToken/refreshToken, data.token.
 */
export function applyAuthRefreshPayload(json: unknown): boolean {
  if (!json || typeof json !== 'object') return false
  const o = json as Record<string, unknown>

  const meta = o.meta as Record<string, unknown> | undefined
  if (meta && typeof meta.token === 'string' && meta.token.length > 0) {
    authService.setToken(meta.token)
    return true
  }

  if (typeof o.accessToken === 'string' && o.accessToken.length > 0) {
    authService.setToken(o.accessToken)
    if (typeof o.refreshToken === 'string' && o.refreshToken.length > 0) {
      authService.setRefreshToken(o.refreshToken)
    }
    return true
  }

  const data = o.data as Record<string, unknown> | undefined
  if (data && typeof data.token === 'string' && data.token.length > 0) {
    authService.setToken(data.token)
    return true
  }

  return false
}
