/**
 * Утилиты для преобразования данных из API в формат компонентов
 */

import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '../types'

/**
 * Нормализует формат даты из API в ISO 8601 для корректного парсинга
 * Преобразует "2026-01-07 09:00:00 +0100" в "2026-01-07T09:00:00+01:00"
 */
const normalizeDateString = (dateString: string): string => {
  if (!dateString) return dateString
  
  // Если уже в ISO формате, возвращаем как есть
  if (dateString.includes('T') && (dateString.includes('+') || dateString.includes('Z') || dateString.includes('-'))) {
    // Проверяем, что часовой пояс уже нормализован (содержит двоеточие)
    if (dateString.match(/[+-]\d{2}:\d{2}/)) {
      return dateString
    }
  }
  
  // Убираем лишние пробелы
  let normalized = dateString.trim()
  
  // Заменяем первый пробел между датой и временем на T
  // Формат: "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
  normalized = normalized.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, '$1T$2')
  
  // Нормализуем часовой пояс: ищем паттерн +/-HHMM или +/-HH:MM в конце строки
  // Преобразуем "+0100" -> "+01:00" или "-0500" -> "-05:00"
  normalized = normalized.replace(/([+-])(\d{2})(\d{2})(\s*)$/, '$1$2:$3$4')
  
  return normalized
}

/**
 * Безопасно парсит строку даты в Date объект
 */
const parseDate = (dateString?: string): Date | null => {
  if (!dateString) return null

  try {
    // Нормализуем формат перед парсингом
    const normalized = normalizeDateString(dateString)
    const date = new Date(normalized)

    if (!isNaN(date.getTime())) {
      return date
    }

    // Пробуем парсить без нормализации (на случай другого формата)
    const fallbackDate = new Date(dateString)
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate
    }

    // Ручной парсинг для строгих WebView (например, Telegram)
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
 * Форматирует дату для отображения
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Дата не указана'
  
  const date = parseDate(dateString)
  if (!date) {
    return 'Дата не указана'
  }
  
  try {
    const day = date.getDate()
    const month = date.toLocaleDateString('ru-RU', { month: 'long' })
    return `${day} ${month}`
  } catch {
    return 'Дата не указана'
  }
}

/**
 * Форматирует время для отображения
 */
const formatTime = (startTime?: string, endTime?: string): string => {
  if (!startTime && !endTime) return 'Время не указано'
  if (startTime && endTime) {
    const startDate = parseDate(startTime)
    const endDate = parseDate(endTime)
    
    if (!startDate || !endDate) {
      return 'Время не указано'
    }
    
    try {
      const start = startDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })
      const end = endDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return `${start} - ${end}`
    } catch {
      return 'Время не указано'
    }
  }
  return startTime || endTime || 'Время не указано'
}

/**
 * Рассчитывает длительность смены в часах
 */
const getDuration = (start?: string, end?: string): string => {
  if (!start || !end) return ''
  
  const startDate = parseDate(start)
  const endDate = parseDate(end)
  
  if (!startDate || !endDate) {
    return ''
  }
  
  try {
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffHrs = Math.round(diffMs / (1000 * 60 * 60))
    return diffHrs > 0 ? `${diffHrs} ч.` : ''
  } catch {
    return ''
  }
}

/**
 * Получает оплату с приоритетом общей суммы над почасовой ставкой
 * Если есть общая сумма (payment) - используем её
 * Иначе считаем: hourly_rate * длительность
 */
const getPayment = (
  payment?: string | number,
  hourlyRate?: string | number,
  startTime?: string,
  endTime?: string
): number => {
  // Приоритет 1: Общая сумма (payment)
  if (payment) {
    const pay = typeof payment === 'string' ? parseFloat(payment) : payment
    if (!isNaN(pay) && pay > 0) {
      return pay
    }
  }

  // Приоритет 2: Почасовая ставка * длительность
  if (hourlyRate && startTime && endTime) {
    const rate = typeof hourlyRate === 'string' ? parseFloat(hourlyRate) : hourlyRate
    if (!isNaN(rate) && rate > 0) {
      const startDate = parseDate(startTime)
      const endDate = parseDate(endTime)
      
      if (!startDate || !endDate) {
        return 0
      }
      
      try {
        const diffMs = endDate.getTime() - startDate.getTime()
        const diffHrs = diffMs / (1000 * 60 * 60)
        const total = rate * diffHrs
        return Math.round(total)
      } catch {
        // Игнорируем ошибки парсинга
      }
    }
  }

  // Приоритет 3: Только почасовая ставка (если нет длительности)
  if (hourlyRate) {
    const rate = typeof hourlyRate === 'string' ? parseFloat(hourlyRate) : hourlyRate
    if (!isNaN(rate) && rate > 0) {
      return rate
    }
  }

  return 0
}

/**
 * Получает эмодзи-логотип для вакансии
 */
const getLogo = (id: number): string => {
  const logos = ['🌅', '🌸', '🍹', '🥖', '🍕', '☕️', '🍽', '🥘']
  return logos[id % logos.length]
}

/**
 * Безопасно преобразует значение в число
 */
const toNumber = (value: unknown, defaultValue = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return !isNaN(parsed) ? parsed : defaultValue
  }
  return defaultValue
}

/**
 * Преобразует данные вакансии из API в формат Shift для компонента
 */
export const mapVacancyToShift = (vacancy: VacancyApiItem): Shift => {
  const duration = getDuration(vacancy.start_time, vacancy.end_time)
  const timeFormatted = formatTime(vacancy.start_time, vacancy.end_time)
  const timeWithDuration = duration ? `${timeFormatted} (${duration})` : timeFormatted

  return {
    id: vacancy.id,
    logo: getLogo(vacancy.id),
    restaurant:
      vacancy.user?.name || vacancy.user?.full_name || vacancy.title || 'Ресторан',
    rating: toNumber(vacancy.user?.average_rating, 0),
    position: vacancy.position || vacancy.target_roles?.[0] || 'Сотрудник',
    specialization: vacancy.specialization || null,
    date: formatDate(vacancy.start_time),
    time: timeWithDuration,
    pay: getPayment(
      vacancy.payment,
      vacancy.hourly_rate,
      vacancy.start_time,
      vacancy.end_time
    ),
    currency: 'BYN',
    location: vacancy.location || vacancy.user?.restaurant_profile?.city || '',
    duration,
    urgent: vacancy.urgent || false,
    badges: vacancy.urgent ? ['🔥 Срочно'] : undefined,
  }
}
