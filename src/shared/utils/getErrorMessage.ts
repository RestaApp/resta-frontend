/**
 * Извлекает список сообщений об ошибке из RTK Query / произвольного error.
 */
export function getErrorMessages(error: unknown): string[] {
  if (error == null) return []
  if (typeof error === 'string') return error.trim() ? [error] : []
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data
    if (data && typeof data === 'object') {
      const api = data as { errors?: unknown; message?: unknown; error?: unknown }
      if (Array.isArray(api.errors)) {
        return api.errors.filter((value): value is string => typeof value === 'string')
      }
      if (typeof api.message === 'string' && api.message.trim()) return [api.message]
      if (typeof api.error === 'string' && api.error.trim()) return [api.error]
    }
  }
  if (error instanceof Error && error.message.trim()) return [error.message]
  return []
}

/**
 * Извлекает первое сообщение об ошибке из RTK Query / произвольного error.
 */
export function getErrorMessage(error: unknown): string | null {
  const messages = getErrorMessages(error)
  return messages[0] ?? null
}
