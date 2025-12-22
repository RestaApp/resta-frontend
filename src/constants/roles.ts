/**
 * Константы и конфигурации ролей
 */

import { ChefHat, UtensilsCrossed, Wine, Coffee, UserCog } from 'lucide-react'
import type { EmployeeSubRole, UserRole, EmployeeRole } from '../types'

export const ROLE_LABELS: Record<UserRole, string> = {
  chef: 'Повар',
  waiter: 'Официант',
  bartender: 'Бармен',
  barista: 'Бариста',
  admin: 'Администратор',
  manager: 'Менеджер',
  support: 'Поддержка',
  venue: 'Заведение',
  supplier: 'Поставщик',
  unverified: 'Непроверенный',
} as const

export const EMPLOYEE_SUBROLES: ReadonlyArray<EmployeeSubRole> = [
  {
    id: 'chef',
    title: 'Повар',
    description: 'Готовлю блюда и управляю кухней',
    icon: ChefHat,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'waiter',
    title: 'Официант',
    description: 'Обслуживаю гостей в зале',
    icon: UtensilsCrossed,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'bartender',
    title: 'Бармен',
    description: 'Готовлю напитки и коктейли',
    icon: Wine,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'barista',
    title: 'Бариста',
    description: 'Готовлю кофе и кофейные напитки',
    icon: Coffee,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'admin',
    title: 'Администратор',
    description: 'Управляю заведением и персоналом',
    icon: UserCog,
    color: 'from-indigo-500 to-blue-600',
  },
] as const

// Emoji для быстрых визуализаций позиций (используется в UI выбора позиций)
export const POSITION_EMOJI_MAP: Record<string, string> = {
  chef: '👨‍🍳',
  waiter: '🍽️',
  bartender: '🍸',
  barista: '☕',
  manager: '👔',
  support: '💼',
} as const

export const EMPLOYEE_ROLES: readonly EmployeeRole[] = [
  'chef',
  'waiter',
  'bartender',
  'barista',
  'admin',
  'manager',
  'support',
] as const
