/**
 * Утилиты для работы с датами/временем и форматирования для отображения
 */

/**
 * Нормализует формат даты из API в ISO 8601 для корректного парсинга
 * Преобразует "2026-01-07 09:00:00 +0100" в "2026-01-07T09:00:00+01:00"
 */
export const normalizeDateString = (dateString: string): string => {
  if (!dateString) return dateString
  if (dateString.includes('T') && (dateString.includes('+') || dateString.includes('Z') || dateString.includes('-'))) {
    if (dateString.match(/[+-]\d{2}:\d{2}/)) {
      return dateString
    }
  }
  let normalized = dateString.trim()
  normalized = normalized.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, '$1T$2')
  normalized = normalized.replace(/([+-])(\d{2})(\d{2})(\s*)$/, '$1$2:$3$4')
  return normalized
}

/**
 * Безопасно парсит строку даты в Date объект
 */
export const parseDate = (dateString?: string): Date | null => {
  if (!dateString) return null
  try {
    const normalized = normalizeDateString(dateString)
    const date = new Date(normalized)
    if (!isNaN(date.getTime())) {
      return date
    }
    const fallbackDate = new Date(dateString)
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate
    }
    const match = dateString.trim().match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{3}))?(?:\s*(Z|([+-])(\d{2}):?(\d{2})))?$/
    )
    if (!match) {
      return null
    }
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const day = Number(match[3])
    const hour = Number(match[4])
    const minute = Number(match[5])
    const second = match[6] ? Number(match[6]) : 0
    const ms = match[7] ? Number(match[7]) : 0
    const timezone = match[8]
    const sign = match[9]
    const tzHour = match[10] ? Number(match[10]) : 0
    const tzMin = match[11] ? Number(match[11]) : 0
    if (timezone === 'Z') {
      return new Date(Date.UTC(year, month, day, hour, minute, second, ms))
    }
    if (sign) {
      const offsetMinutes = tzHour * 60 + tzMin
      const utcMs = Date.UTC(year, month, day, hour, minute, second, ms)
      const offsetMs = offsetMinutes * 60 * 1000
      return new Date(sign === '+' ? utcMs - offsetMs : utcMs + offsetMs)
    }
    return new Date(year, month, day, hour, minute, second, ms)
  } catch {
    return null
  }
}

/**
 * Форматирует дату для отображения (например: "7 января")
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Дата не указана'
  const date = parseDate(dateString)
  if (!date) return 'Дата не указана'
  try {
    const day = date.getDate()
    const month = date.toLocaleDateString('ru-RU', { month: 'long' })
    return `${day} ${month}`
  } catch {
    return 'Дата не указана'
  }
}

/**
 * Форматирует время для отображения (например: "09:00 - 18:00")
 */
export const formatTime = (startTime?: string, endTime?: string): string => {
  if (!startTime && !endTime) return 'Время не указано'
  if (startTime && endTime) {
    const startDate = parseDate(startTime)
    const endDate = parseDate(endTime)
    if (!startDate || !endDate) return 'Время не указано'
    try {
      const start = startDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      const end = endDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      return `${start} - ${end}`
    } catch {
      return 'Время не указано'
    }
  }
  return startTime || endTime || 'Время не указано'
}

/**
 * Рассчитывает длительность смены в часах (возвращает строку "X ч.")
 */
export const getDuration = (start?: string, end?: string): string => {
  if (!start || !end) return ''
  const startDate = parseDate(start)
  const endDate = parseDate(end)
  if (!startDate || !endDate) return ''
  try {
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffHrs = Math.round(diffMs / (1000 * 60 * 60))
    return diffHrs > 0 ? `${diffHrs} ч.` : ''
  } catch {
    return ''
  }
}

