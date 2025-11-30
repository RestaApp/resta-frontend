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
  Package,
} from 'lucide-react'
import type { RoleOption, EmployeeSubRole, UserRole, EmployeeRole } from '../types'
import type { RoleApiItem } from '../services/api/rolesApi'
import type { PositionApiItem } from '../services/api/usersApi'
import {
  getEmployeePositionLabel,
  getEmployeePositionDescription,
  getUserRoleLabel,
} from '../constants/labels'

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
  manager: 'admin', // manager -> admin
  support: 'admin', // support -> admin
}


/**
 * Маппинг ролей на иконки
 */
const ROLE_ICON_MAP: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  chef: User,
  waiter: UtensilsCrossed,
  bartender: Wine,
  barista: Coffee,
  admin: UserCog,
  venue: Store,
  supplier: Package,
  unverified: User,
}

/**
 * Маппинг ролей на цвета
 */
const ROLE_COLOR_MAP: Record<UserRole, string> = {
  chef: 'from-blue-500 to-cyan-500',
  waiter: 'from-green-500 to-emerald-500',
  bartender: 'from-purple-500 to-pink-500',
  barista: 'from-amber-500 to-orange-500',
  admin: 'from-indigo-500 to-blue-600',
  venue: 'from-orange-500 to-red-500',
  supplier: 'from-indigo-500 to-blue-600',
  unverified: 'from-gray-500 to-gray-600',
}

/**
 * Маппинг ролей на описания
 */
const ROLE_DESCRIPTION_MAP: Record<UserRole, string> = {
  chef: 'Готовлю блюда и управляю кухней',
  waiter: 'Обслуживаю гостей в зале',
  bartender: 'Готовлю напитки и коктейли',
  barista: 'Готовлю кофе и кофейные напитки',
  admin: 'Управляю заведением и персоналом',
  venue: 'Ищу персонал и поставщиков',
  supplier: 'Предлагаю товары и услуги',
  unverified: 'Роль не подтверждена',
}



/**
 * Преобразует данные роли из API в формат компонента
 */
export function mapRoleOptionFromApi(roleApi: RoleApiItem): RoleOption | null {
  const roleId = VALUE_TO_ROLE_MAP[roleApi.value]
  
  if (!roleId) {
    return null
  }

  return {
    id: roleId,
    title: getUserRoleLabel(roleApi.value) || roleApi.label,
    description: ROLE_DESCRIPTION_MAP[roleId],
    icon: ROLE_ICON_MAP[roleId],
    color: ROLE_COLOR_MAP[roleId],
  }
}

/**
 * Преобразует массив ролей из API в формат компонентов
 */
export function mapRoleOptionsFromApi(rolesApi: RoleApiItem[]): RoleOption[] {
  return rolesApi
    .map(mapRoleOptionFromApi)
    .filter((role): role is RoleOption => role !== null)
}

/**
 * Преобразует одну позицию из API в формат компонента
 */
export function mapPositionFromApi(positionApi: PositionApiItem): EmployeeSubRole | null {
  const roleId = POSITION_VALUE_TO_ROLE_MAP[positionApi.value]
  
  if (!roleId) {
    return null
  }

  const icon = ROLE_ICON_MAP[roleId]
  const color = ROLE_COLOR_MAP[roleId]
  
  // Используем функции из labels.ts для получения названий и описаний
  const description = getEmployeePositionDescription(positionApi.value) || ROLE_DESCRIPTION_MAP[roleId]
  const title = getEmployeePositionLabel(positionApi.label) || getEmployeePositionLabel(positionApi.value) || positionApi.label

  if (!icon || !color) {
    return null
  }

  return {
    id: roleId,
    title,
    description,
    icon,
    color,
    originalValue: positionApi.value, // Сохраняем оригинальное value для уникальности ключей
  }
}

/**
 * Преобразует массив позиций из API в формат компонентов
 */
export function mapEmployeeSubRolesFromApi(
  positionsApi: PositionApiItem[]
): EmployeeSubRole[] {
  return positionsApi
    .map(mapPositionFromApi)
    .filter((role): role is EmployeeSubRole => role !== null)
}

