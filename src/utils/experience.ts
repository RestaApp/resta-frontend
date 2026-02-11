/**
 * Утилиты для форматирования опыта работы
 */

import i18n from '@/shared/i18n/config'

/**
 * Возвращает правильное склонение слова "год" в зависимости от числа
 */
export const getYearsLabel = (years: number): string => {
  const mod100 = years % 100
  const mod10 = years % 10

  if (mod100 >= 11 && mod100 <= 14) return i18n.t('experience.years5')
  if (mod10 === 1) return i18n.t('experience.year')
  if (mod10 >= 2 && mod10 <= 4) return i18n.t('experience.years2')
  return i18n.t('experience.years5')
}

/**
 * Форматирует значение опыта работы в читаемый текст
 */
export const formatExperienceText = (value: number): string => {
  if (value === 0) return i18n.t('experience.noExperience')
  if (value === 5) return i18n.t('experience.years5Plus')
  return `${value} ${getYearsLabel(value)}`
}
