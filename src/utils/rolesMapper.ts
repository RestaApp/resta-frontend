/**
 * Утилиты для маппинга данных ролей из API в формат компонентов
 */

import {
  UtensilsCrossed,
  Wine,
  Coffee,
  UserCog,
  User,
  Store,
  ChefHat,
  Truck,
  Briefcase,
  Headphones,
} from 'lucide-react'
import type { RoleOption, EmployeeSubRole, UserRole, EmployeeRole } from '@/types'
import {
  getEmployeePositionLabel,
  getEmployeePositionDescription,
  getUserRoleLabel,
} from '@/constants/labels'

/**
 * Маппинг value из API на UserRole
 */
const VALUE_TO_ROLE_MAP: Record<string, UserRole> = {
  employee: 'chef', // employee -> chef (для сотрудников)
  restaurant: 'venue', // restaurant -> venue (для заведения)
  supplier: 'supplier', // supplier -> supplier (для поставщика)
}

/**
 * Маппинг value из API позиций на EmployeeRole
 */
const POSITION_VALUE_TO_ROLE_MAP: Record<string, EmployeeRole> = {
  chef: 'chef',
  waiter: 'waiter',
  bartender: 'bartender',
  barista: 'barista',
  manager: 'manager',
  support: 'support',
}

// Иконки и цвета для отдельных позиций (override)
const POSITION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  manager: Briefcase,
  support: Headphones,
}

const POSITION_COLOR_MAP: Record<string, string> = {
  manager: 'from-indigo-500 to-blue-600',
  support: 'from-gray-500 to-gray-600',
}

/**
 * Маппинг ролей на иконки
 */
const ROLE_ICON_MAP: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  chef: ChefHat, // employee -> chef использует ChefHat
  waiter: UtensilsCrossed,
  bartender: Wine,
  barista: Coffee,
  admin: UserCog,
  manager: Briefcase,
  support: Headphones,
  venue: Store, // restaurant -> venue использует Store
  supplier: Truck, // supplier использует Truck
  unverified: User,
}

/**
 * Маппинг ролей на цвета (градиенты)
 */
const ROLE_COLOR_MAP: Record<UserRole, string> = {
  chef: 'from-[#d16b9f] to-[#8b5da8]', // employee -> chef
  waiter: 'from-green-500 to-emerald-500',
  bartender: 'from-purple-500 to-pink-500',
  barista: 'from-amber-500 to-orange-500',
  admin: 'from-indigo-500 to-blue-600',
  manager: 'from-indigo-500 to-blue-600',
  support: 'from-gray-500 to-gray-600',
  venue: 'from-[#8b5da8] to-[#6b4c9a]', // restaurant -> venue
  supplier: 'from-[#7ec8e3] to-[#a8d5e2]',
  unverified: 'from-gray-500 to-gray-600',
}

/**
 * Маппинг ролей на описания
 */
const ROLE_DESCRIPTION_MAP: Record<UserRole, string> = {
  chef: 'Ищу смены, работу, развитие', // employee -> chef
  waiter: 'Обслуживаю гостей в зале',
  bartender: 'Готовлю напитки и коктейли',
  barista: 'Готовлю кофе и кофейные напитки',
  admin: 'Управляю заведением и персоналом',
  manager: 'Управляю командой и процессами',
  support: 'Оказываю поддержку и помощь',
  venue: 'Ищу персонал и поставщиков', // restaurant -> venue
  supplier: 'Предлагаю товары и услуги',
  unverified: 'Роль не подтверждена',
}

/**
 * Преобразует данные роли из API в формат компонента
 */
export const mapRoleOptionFromApi = (roleValue: string): RoleOption | null => {
  const roleId = VALUE_TO_ROLE_MAP[roleValue]

  if (!roleId) {
    return null
  }

  return {
    id: roleId,
    title: getUserRoleLabel(roleValue),
    description: ROLE_DESCRIPTION_MAP[roleId],
    icon: ROLE_ICON_MAP[roleId],
    color: ROLE_COLOR_MAP[roleId],
  }
}

/**
 * Преобразует массив ролей из API в формат компонентов
 */
export const mapRoleOptionsFromApi = (rolesApi: string[]): RoleOption[] => {
  return rolesApi.map(mapRoleOptionFromApi).filter((role): role is RoleOption => role !== null)
}

/**
 * Преобразует одну позицию из API в формат компонента
 */
export const mapPositionFromApi = (positionValue: string): EmployeeSubRole | null => {
  const roleId = POSITION_VALUE_TO_ROLE_MAP[positionValue]

  if (!roleId) {
    return null
  }

  const icon = POSITION_ICON_MAP[positionValue] || ROLE_ICON_MAP[roleId as UserRole]
  const color = POSITION_COLOR_MAP[positionValue] || ROLE_COLOR_MAP[roleId as UserRole]

  // Используем функции из labels.ts для получения названий и описаний
  const description =
    getEmployeePositionDescription(positionValue) || ROLE_DESCRIPTION_MAP[roleId as UserRole]
  const title = getEmployeePositionLabel(positionValue)

  if (!icon || !color) {
    return null
  }

  return {
    id: roleId,
    title,
    description,
    icon,
    color,
    originalValue: positionValue, // Сохраняем оригинальное value для уникальности ключей
  }
}

/**
 * Преобразует массив позиций из API в формат компонентов
 */
export const mapEmployeeSubRolesFromApi = (positionsApi: string[]): EmployeeSubRole[] => {
  return positionsApi
    .map(mapPositionFromApi)
    .filter((role): role is EmployeeSubRole => role !== null)
}
