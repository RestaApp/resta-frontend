/**
 * Утилиты для работы с датами и временем
 */

const normalizeDateString = (value: string): string => {
  if (!value) return value
  const v = value.trim()

  return v
    .replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, '$1T$2')
    .replace(/([+-])(\d{2})(\d{2})$/, '$1$2:$3')
}

export const parseDate = (value?: string): Date | null => {
  if (!value) return null
  const raw = value.trim()

  if (/^\d+$/.test(raw)) {
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    const ms = raw.length <= 10 ? n * 1000 : n
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const m = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?(?:\s*(Z|[+-]\d{2}:?\d{2}))?$/
  )

  if (m) {
    const year = Number(m[1])
    const month = Number(m[2])
    const day = Number(m[3])
    const hours = Number(m[4] ?? '0')
    const minutes = Number(m[5] ?? '0')
    const seconds = Number(m[6] ?? '0')
    const timezoneRaw = m[7] ?? ''

    if (timezoneRaw) {
      const timezone = timezoneRaw.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
      const iso = `${m[1]}-${m[2]}-${m[3]}T${String(hours).padStart(2, '0')}:${String(
        minutes
      ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${timezone}`
      const d = new Date(iso)
      return Number.isNaN(d.getTime()) ? null : d
    }

    const d = new Date(year, month - 1, day, hours, minutes, seconds)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const d = new Date(normalizeDateString(raw))
  return Number.isNaN(d.getTime()) ? null : d
}

export const toLocalISODateKey = (d: Date): string => {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Преобразует строку времени (HH:mm) в количество минут
 */
export const toMinutes = (value: string): number | null => {
  if (!value) return null
  const match = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours < 0 || hours > 23) return null
  if (minutes < 0 || minutes > 59) return null

  return hours * 60 + minutes
}

/**
 * Объединяет дату (YYYY-MM-DD) и время (HH:mm) в строку формата для API
 */
export const buildDateTime = (date: string, time: string): string => {
  if (!date || !time) {
    throw new Error('Date and time are required')
  }

  const dateMatch = date.match(/^(\d{4}-\d{2}-\d{2})$/)
  if (!dateMatch) {
    throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`)
  }

  const timeMatch = time.match(/^(\d{1,2}):(\d{1,2})$/)
  if (!timeMatch) {
    throw new Error(`Invalid time format: ${time}. Expected HH:mm`)
  }

  const [, hours, minutes] = timeMatch
  const hoursNumber = Number(hours)
  const minutesNumber = Number(minutes)
  if (Number.isNaN(hoursNumber) || Number.isNaN(minutesNumber)) {
    throw new Error(`Invalid time value: ${time}. Expected HH:mm`)
  }
  if (hoursNumber < 0 || hoursNumber > 23) {
    throw new Error(`Invalid hours value: ${time}. Expected 00-23`)
  }
  if (minutesNumber < 0 || minutesNumber > 59) {
    throw new Error(`Invalid minutes value: ${time}. Expected 00-59`)
  }
  const paddedHours = String(hoursNumber).padStart(2, '0')
  const paddedMinutes = String(minutesNumber).padStart(2, '0')

  return `${date} ${paddedHours}:${paddedMinutes}:00`
}

export const getTodayDateISO = (): string => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Добавляет дни к дате в формате YYYY-MM-DD.
 */
export const addDaysToISODate = (isoDate: string, days: number): string => {
  const d = new Date(isoDate + 'T00:00:00')
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${isoDate}`)
  d.setDate(d.getDate() + days)
  return toLocalISODateKey(d)
}
