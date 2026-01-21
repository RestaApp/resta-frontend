export type ApiErrorData = {
  message?: string
  missing_fields?: string[]
}

export type ApiErrorLike =
  | { data?: ApiErrorData }
  | { error?: unknown }
  | unknown

export type ProfileIncompleteError = {
  kind: 'profile_incomplete'
  missingFields: string[]
  message: string
}

export type NormalizedApiError =
  | ProfileIncompleteError
  | { kind: 'generic'; message: string }

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

export const normalizeApiError = (
  error: unknown,
  fallbackMessage: string
): NormalizedApiError => {
  if (isObject(error) && 'data' in error && isObject(error.data)) {
    const data = error.data as ApiErrorData

    if (data.message === 'profile_incomplete') {
      const missingFields = Array.isArray(data.missing_fields) ? data.missing_fields : []
      const fieldsText = missingFields.length ? missingFields.join(', ') : 'неизвестные поля'

      return {
        kind: 'profile_incomplete',
        missingFields,
        message: `Профиль неполный: отсутствуют поля — ${fieldsText}. Пожалуйста, заполните профиль в настройках.`,
      }
    }

    return { kind: 'generic', message: data.message || fallbackMessage }
  }

  // RTK Query unwrap иногда кидает Error
  if (error instanceof Error) {
    return { kind: 'generic', message: error.message || fallbackMessage }
  }

  return { kind: 'generic', message: fallbackMessage }
}
