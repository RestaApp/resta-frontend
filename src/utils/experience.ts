/**
 * Утилиты для форматирования опыта работы
 */

/**
 * Возвращает правильное склонение слова "год" в зависимости от числа
 */
export const getYearsLabel = (years: number): string => {
  const mod100 = years % 100
  const mod10 = years % 10

  if (mod100 >= 11 && mod100 <= 14) return 'лет'
  if (mod10 === 1) return 'год'
  if (mod10 >= 2 && mod10 <= 4) return 'года'
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

