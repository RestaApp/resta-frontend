/**
 * Чистые хелперы разбора серверных ошибок submit'а смены (create/update).
 * Вынесены из `useAddShiftFormSubmission` для изоляции и тестируемости —
 * без React/RTK/store зависимостей.
 */

export interface ServerErrorBag {
  errors?: unknown
  message?: unknown
  error?: unknown
  feature?: unknown
}

/** Дискриминатор серверного ответа «дубликат вакансии» (feature-флаг бэка). */
export const vacancyUniquenessToken = 'vacancy_uniqueness'

/**
 * Нормализует «мешок» серверной ошибки в список сообщений.
 * Приоритет: vacancy_uniqueness → errors[] → message → error.
 */
export const toServerErrorMessages = (bag: ServerErrorBag): string[] => {
  if (bag.feature === vacancyUniquenessToken) {
    return [typeof bag.error === 'string' ? bag.error : vacancyUniquenessToken]
  }
  if (Array.isArray(bag.errors)) {
    return bag.errors.map(e => String(e))
  }
  if (typeof bag.message === 'string') return [bag.message]
  if (typeof bag.error === 'string') return [bag.error]
  return []
}

/** Достаёт ошибки из брошенного RTK-Query error (`{ data }`) или нативного Error. */
export const extractServerErrors = (error: unknown): { messages?: string[]; single?: string } => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: unknown }).data
    if (data && typeof data === 'object') {
      const messages = toServerErrorMessages(data as ServerErrorBag)
      if (messages.length > 0) return { messages }
    }
  }
  if (error instanceof Error) return { single: error.message }
  return {}
}

/** Содержит ли «успешный» (не throw) ответ инлайновые ошибки валидации. */
export const hasInlineErrors = (
  result: unknown
): result is { errors?: unknown; message?: unknown; success?: false } => {
  if (!result || typeof result !== 'object') return false
  const r = result as Record<string, unknown>
  return r.success === false || (Array.isArray(r.errors) && r.errors.length > 0) || !!r.errors
}

/** Сообщения из инлайнового (не throw) ответа. */
export const inlineErrorMessages = (result: unknown): string[] => {
  if (!result || typeof result !== 'object') return []
  return toServerErrorMessages(result as ServerErrorBag)
}
