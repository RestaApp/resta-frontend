/**
 * Лейблы для маппера ролей (API → карточки выбора).
 * Остальной интерфейс использует useLabels() и i18n.
 */

import type { ApiRole, EmployeeRole } from '@/types'
import { normalizeEmployeePosition } from '@/utils/roles'

const EMPLOYEE_POSITION_LABELS = {
  chef: 'Повар',
  waiter: 'Официант',
  bartender: 'Бармен',
  barista: 'Бариста',
  hostess: 'Хостес',
  delivery: 'Доставка',
  cashier: 'Кассир',
  office: 'Офис',
  manager: 'Менеджер',
  support: 'Поддержка',
  admin: 'Администратор',
} as const satisfies Record<EmployeeRole, string>

const EMPLOYEE_POSITION_DESCRIPTIONS: Record<EmployeeRole, string> = {
  chef: 'Готовлю блюда и управляю кухней',
  waiter: 'Обслуживаю гостей в зале',
  bartender: 'Готовлю напитки и коктейли',
  barista: 'Готовлю кофе и кофейные напитки',
  hostess: 'Встречаю гостей и управляю посадкой',
  delivery: 'Доставляю заказы гостям',
  cashier: 'Работаю на кассе и принимаю оплату',
  office: 'Работаю в офисной команде',
  manager: 'Управляю заведением и персоналом',
  support: 'Оказываю техническую поддержку',
  admin: 'Управляю заведением и персоналом',
} as const

const USER_ROLE_LABELS = {
  employee: 'Сотрудник',
  restaurant: 'Заведение',
  supplier: 'Поставщик',
} as const satisfies Record<Exclude<ApiRole, 'unverified'>, string>

export const getEmployeePositionLabel = (value: string): string => {
  const key = normalizeEmployeePosition(value)
  return key ? EMPLOYEE_POSITION_LABELS[key] : value
}

export const getEmployeePositionDescription = (value: string): string => {
  const key = normalizeEmployeePosition(value)
  return key ? EMPLOYEE_POSITION_DESCRIPTIONS[key] : ''
}

export const getUiRoleLabel = (value: string): string => {
  return USER_ROLE_LABELS[value as Exclude<ApiRole, 'unverified'>] || value
}
