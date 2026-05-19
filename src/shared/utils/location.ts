/** Приводит location из API к строке (строка, объект city/address, массив точек). */
export const normalizeApiLocation = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  if (Array.isArray(value)) {
    const parts = value
      .map(part => normalizeApiLocation(part))
      .filter((part): part is string => Boolean(part))
    return parts.length > 0 ? parts.join('\n') : undefined
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
      const combined = combineLocation(city, address).trim()
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

export const combineLocation = (city: string, address: string): string => {
  const c = city.trim()
  const a = address.trimStart()
  if (!c && !a) return ''
  if (!c) return a
  if (!a.trim()) return c
  return `${c}, ${a}`
}

export const splitLocationPoints = (location?: string | null): string[] => {
  if (!location) return []
  return location
    .split(/\r?\n+/)
    .map(value => value.trim())
    .filter(Boolean)
}
