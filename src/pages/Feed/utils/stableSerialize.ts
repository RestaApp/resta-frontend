type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype

const normalize = (value: unknown): Json => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) return value

  if (Array.isArray(value)) return value.map(normalize)

  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort()
    const out: Record<string, Json> = {}
    for (const k of keys) out[k] = normalize(value[k])
    return out
  }

  // всё остальное (Date, Map, функции) — не ожидается в query
  return String(value) as Json
}

export const stableSerialize = (value: unknown): string => JSON.stringify(normalize(value))
