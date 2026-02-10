/**
 * Извлекает сообщение об ошибке из RTK Query / произвольного error.
 */
export function getErrorMessage(error: unknown): string | null {
  if (error == null) return null
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data
    if (data && typeof data === 'object') {
      const api = data as { errors?: string[]; message?: string; error?: string }
      if (Array.isArray(api.errors) && api.errors.length > 0) return api.errors[0] ?? null
      if (typeof api.message === 'string') return api.message
      if (typeof api.error === 'string') return api.error
    }
  }
  if (error instanceof Error) return error.message
  return null
}
