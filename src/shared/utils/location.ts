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
    if (city || address) {
      const combined = combineCityAddress(city, address)
      return combined || undefined
    }

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

/** Сериализация массива в строку через `\n` — для legacy‑потребителей. */
export const joinLocations = (locations: string[] | null | undefined): string => {
  if (!locations || locations.length === 0) return ''
  return locations
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n')
}

/** Очистка массива адресов перед сохранением: trim + удаление пустых. */
export const sanitizeLocations = (locations: string[]): string[] => {
  return locations.map(line => line.trim()).filter(Boolean)
}

/** Разбор «Город, адрес» → `{ city, address }`. Используется в employee‑форме смены. */
export const parseLocation = (location: string): { city: string; address: string } => {
  if (!location.trim()) return { city: '', address: '' }
  const commaIndex = location.indexOf(',')
  if (commaIndex === -1) {
    return { city: '', address: location }
  }
  const city = location.substring(0, commaIndex).trim()
  const address = location.substring(commaIndex + 1).trimStart()
  return { city, address }
}

/** Склейка `city` + `address` обратно в строку формата «Город, адрес». */
export const combineLocation = (city: string, address: string): string => {
  return combineCityAddress(city, address)
}

const combineCityAddress = (city: string, address: string): string => {
  const c = city.trim()
  const a = address.trim()
  if (!c && !a) return ''
  if (!c) return a
  if (!a) return c
  return `${c}, ${a}`
}
