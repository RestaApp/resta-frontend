import type { TFunction } from 'i18next'

export type ApiErrorData = {
  message?: string
  missing_fields?: string[]
}

export type ProfileIncompleteError = {
  kind: 'profile_incomplete'
  missingFields: string[]
  missingFieldsLabels: string[]
  message: string
}

export type NormalizedApiError =
  | ProfileIncompleteError
  | { kind: 'generic'; message: string }

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

export const mapMissingFieldsToLabels = (fields: string[], t: TFunction): string[] =>
  fields.map((f) => t(`profileFields.${f}`) || f)

const isNormalizedApiError = (v: unknown): v is NormalizedApiError =>
  isObject(v) && 'kind' in v && typeof v.kind === 'string'

export const normalizeApiError = (
  error: unknown,
  fallbackMessage: string,
  t: TFunction
): NormalizedApiError => {
  if (isNormalizedApiError(error)) return error

  if (isObject(error) && 'data' in error && isObject(error.data)) {
    const data = error.data as ApiErrorData

    if (data.message === 'profile_incomplete') {
      const missingFields = Array.isArray(data.missing_fields) ? data.missing_fields : []
      const missingFieldsLabels = mapMissingFieldsToLabels(missingFields, t)
      const fieldsText = missingFieldsLabels.length ? missingFieldsLabels.join(', ') : t('common.unknownFields')

      return {
        kind: 'profile_incomplete',
        missingFields,
        missingFieldsLabels,
        message: t('errors.profileIncomplete', { fields: fieldsText }),
      }
    }

    return { kind: 'generic', message: data.message || fallbackMessage }
  }

  if (error instanceof Error) {
    return { kind: 'generic', message: error.message || fallbackMessage }
  }

  return { kind: 'generic', message: fallbackMessage }
}
