/**
 * Константы заголовков для drawer выбора специализаций
 */

export const DRAWER_TITLES: Record<string, string> = {
  chef: 'Какой вы повар?',
  waiter: 'Ваша специализация?',
  bartender: 'Ваш уровень в барменстве?',
  barista: 'Ваш уровень бариста?',
  default: 'Настройка профиля',
} as const

/**
 * Получить заголовок drawer на основе позиции
 */
export const getDrawerTitle = (position: string | null, hasSpecializations: boolean): string => {
  if (!position) {
    return DRAWER_TITLES.default
  }

  if (!hasSpecializations) {
    return DRAWER_TITLES.default
  }

  return DRAWER_TITLES[position.toLowerCase()] || DRAWER_TITLES.default
}
