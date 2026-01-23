/**
 * Утилиты для работы с датами и временем
 */

/**
 * Нормализует строку даты из формата API в ISO формат
 * "2026-01-07 09:00:00 +0100" -> "2026-01-07T09:00:00+01:00"
 */
export const normalizeDateString = (value: string): string => {
  if (!value) return value
  const v = value.trim()

  return v
    .replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, '$1T$2')
    .replace(/([+-])(\d{2})(\d{2})$/, '$1$2:$3')
}

export const parseDate = (value?: string): Date | null => {
  if (!value) return null
  const d = new Date(normalizeDateString(value))
  return Number.isNaN(d.getTime()) ? null : d
}

export const formatDate = (value?: string, locale: string = 'ru-RU'): string => {
  const d = parseDate(value)
  if (!d) return 'Дата не указана'
  return `${d.getDate()} ${d.toLocaleDateString(locale, { month: 'long' })}`
}

export const formatTimeRange = (start?: string, end?: string, locale: string = 'ru-RU'): string => {
  const s = parseDate(start)
  const e = parseDate(end)
  if (!s && !e) return 'Время не указано'

  const fmt = (d: Date) => d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

  if (s && e) return `${fmt(s)} - ${fmt(e)}`
  if (s) return fmt(s)
  if (e) return fmt(e)
  return 'Время не указано'
}

/**
 * Форматирует время для отображения (алиас для formatTimeRange для обратной совместимости)
 */
export const formatTime = (start?: string, end?: string, locale: string = 'ru-RU'): string => {
  return formatTimeRange(start, end, locale)
}

export const getDurationHoursLabel = (start?: string, end?: string): string => {
  const s = parseDate(start)
  const e = parseDate(end)
  if (!s || !e) return ''
  const diffMs = e.getTime() - s.getTime()
  if (diffMs <= 0) return ''

  const hours = diffMs / (1000 * 60 * 60)
  const rounded = Math.round(hours * 10) / 10
  return `${rounded} ч.`
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
 * @param date - Дата в формате YYYY-MM-DD
 * @param time - Время в формате HH:mm
 * @returns Строка в формате "YYYY-MM-DD HH:mm:00" (без часового пояса, сервер добавит)
 */
export const buildDateTime = (date: string, time: string): string => {
  if (!date || !time) {
    throw new Error('Date and time are required')
  }

  // Проверяем формат даты
  const dateMatch = date.match(/^(\d{4}-\d{2}-\d{2})$/)
  if (!dateMatch) {
    throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`)
  }

  // Проверяем формат времени
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/)
  if (!timeMatch) {
    throw new Error(`Invalid time format: ${time}. Expected HH:mm`)
  }

  const [, hours, minutes] = timeMatch
  const paddedHours = hours.padStart(2, '0')

  return `${date} ${paddedHours}:${minutes}:00`
}

/**
 * Возвращает строку даты завтрашнего дня в формате YYYY-MM-DD.
 * Подходит для использования в полях ввода даты (например, minDate).
 */
export const getTomorrowDateISO = (): string => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}