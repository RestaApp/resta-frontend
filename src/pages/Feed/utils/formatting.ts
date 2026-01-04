/**
 * Утилиты для форматирования данных смен и вакансий
 */

/**
 * Форматирует количество отзывов с правильным склонением
 */
export const formatReviews = (count: number): string => {
    if (count === 1) return 'отзыв'
    if (count < 5) return 'отзыва'
    return 'отзывов'
}

/**
 * Форматирует почасовую ставку
 */
export const formatHourlyRate = (hourlyRate?: string | number | null): string | null => {
    if (!hourlyRate) return null
    const rate = typeof hourlyRate === 'string' ? parseFloat(hourlyRate) : hourlyRate
    return isNaN(rate) ? null : rate.toFixed(2)
}

/**
 * Форматирует тип смены в читаемый формат
 */
export const formatShiftType = (shiftType?: 'vacancy' | 'replacement' | null): string | null => {
    if (!shiftType) return null
    return shiftType === 'replacement' ? 'Замена' : 'Вакансия'
}

/**
 * Форматирует количество заявок с правильным склонением
 */
export const formatApplicationsCount = (count: number): { value: string; label: string } => {
    if (count === 0) {
        return { value: '0', label: 'Пока нет заявок' }
    }
    if (count === 1) {
        return { value: '1', label: 'заявка' }
    }
    if (count < 5) {
        return { value: String(count), label: 'заявки' }
    }
    return { value: String(count), label: 'заявок' }
}

/**
 * Получает заголовок вакансии с приоритетом
 */
export const getVacancyTitle = (title?: string | null, position?: string | null): string => {
    return title || position || 'Вакансия'
}

