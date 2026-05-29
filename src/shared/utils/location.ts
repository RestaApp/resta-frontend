/**
 * Утилиты для работы с location (массив адресов) и city.
 *
 * Контракт: внутри приложения `location` всегда `string[]`.
 * На границе с API нормализуем любые входные форматы (строка / массив / объект)
 * через `toLocationArray`, а на отправке шлём массив.
 */

export const toLocationArray = (value: unknown): string[] => {
  if (value === null || value === undefined) return []

  if (Array.isArray(value)) {
    return value
      .map(part => normalizeLocationEntry(part))
      .filter((part): part is string => Boolean(part))
  }

  const single = normalizeLocationEntry(value)
  if (!single) return []

  // Legacy: одна строка с разделителем `\n` — раскладываем в массив.
  if (single.includes('\n') || single.includes('\r')) {
    return single
      .split(/\r?\n+/)
      .map(line => line.trim())
      .filter(Boolean)
  }

  return [single]
}

const normalizeLocationEntry = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const city = typeof record.city === 'string' ? record.city.trim() : ''
    const address =
      typeof record.address === 'string'
        ? record.address.trim()
        : typeof record.street === 'string'
          ? record.street.trim()
          : ''
    if (address) return address
    if (city) return city

    for (const key of ['name', 'label', 'text'] as const) {
      const candidate = record[key]
      if (typeof candidate === 'string') {
        const trimmed = candidate.trim()
        if (trimmed) return trimmed
      }
    }
  }

  return undefined
}

/** Первый адрес из массива (или undefined). Использовать для карточек/карты. */
export const firstLocation = (locations: string[] | null | undefined): string | undefined => {
  if (!locations || locations.length === 0) return undefined
  const first = locations[0]?.trim()
  return first || undefined
}

/** Очистка массива адресов перед сохранением: trim + удаление пустых. */
export const sanitizeLocations = (locations: string[]): string[] => {
  return locations.map(line => line.trim()).filter(Boolean)
}
