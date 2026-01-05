/**
 * Утилиты для преобразования данных из API в формат компонентов
 */

import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '../types'

/**
 * Форматирует дату для отображения
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Дата не указана'
  try {
    const date = new Date(dateString)
    // Проверяем валидность даты
    if (isNaN(date.getTime())) {
      return 'Дата не указана'
    }
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
    try {
      const startDate = new Date(startTime)
      const endDate = new Date(endTime)
      
      // Проверяем валидность дат
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'Время не указано'
      }
      
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
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    
    // Проверяем валидность дат
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return ''
    }
    
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
    try {
      const rate = typeof hourlyRate === 'string' ? parseFloat(hourlyRate) : hourlyRate
      if (!isNaN(rate) && rate > 0) {
        const startDate = new Date(startTime)
        const endDate = new Date(endTime)
        
        // Проверяем валидность дат
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return 0
        }
        
        const diffMs = endDate.getTime() - startDate.getTime()
        const diffHrs = diffMs / (1000 * 60 * 60)
        const total = rate * diffHrs
        return Math.round(total)
      }
    } catch {
      // Игнорируем ошибки парсинга
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

