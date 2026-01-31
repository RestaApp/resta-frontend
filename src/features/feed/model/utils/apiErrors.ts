export type ApiErrorData = {
  message?: string
  missing_fields?: string[]
}

export type ProfileIncompleteError = {
  kind: 'profile_incomplete'
  missingFields: string[]
  /** Готовые подписи для UI; дублировать mapMissingFieldsToLabels в callers не нужно */
  missingFieldsLabels: string[]
  message: string
}

export type NormalizedApiError =
  | ProfileIncompleteError
  | { kind: 'generic'; message: string }

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

const profileFieldLabels: Record<string, string> = {
  phone: 'Телефон',
  city: 'Город',
  name: 'Имя',
  surname: 'Фамилия',
  email: 'Email',
  position: 'Позиция',
  specialization: 'Специализация',
  experience_years: 'Опыт',
  skills: 'Навыки',
  profile_photo_url: 'Фото',
  photo: 'Фото',
  restaurant_format: 'Формат заведения',
  cuisine_types: 'Кухни',
  address: 'Адрес',
  location: 'Адрес',
  birth_date: 'Дата рождения',
  about: 'О себе',
}

export const mapMissingFieldsToLabels = (fields: string[]): string[] =>
  fields.map((f) => profileFieldLabels[f] ?? f)

const isNormalizedApiError = (v: unknown): v is NormalizedApiError =>
  isObject(v) && 'kind' in v && typeof v.kind === 'string'

export const normalizeApiError = (
  error: unknown,
  fallbackMessage: string
): NormalizedApiError => {
  if (isNormalizedApiError(error)) return error

  if (isObject(error) && 'data' in error && isObject(error.data)) {
    const data = error.data as ApiErrorData

    if (data.message === 'profile_incomplete') {
      const missingFields = Array.isArray(data.missing_fields) ? data.missing_fields : []
      const missingFieldsLabels = mapMissingFieldsToLabels(missingFields)
      const fieldsText = missingFieldsLabels.length ? missingFieldsLabels.join(', ') : 'неизвестные поля'

      return {
        kind: 'profile_incomplete',
        missingFields,
        missingFieldsLabels,
        message: `Чтобы отправить заявку, укажите в профиле: ${fieldsText}.`,
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
