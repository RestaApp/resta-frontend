/**
 * Утилиты для форматирования опыта работы
 */

/**
 * Возвращает правильное склонение слова "год" в зависимости от числа
 */
export const getYearsLabel = (years: number): string => {
    if (years === 1) return 'год'
    if (years < 5) return 'года'
    return 'лет'
}

/**
 * Форматирует значение опыта работы в читаемый текст
 */
export const formatExperienceText = (value: number): string => {
    if (value === 0) return 'Без опыта'
    if (value === 5) return '5+ лет'
    return `${value} ${getYearsLabel(value)}`
}

