/**
 * Константы с переводами и названиями для различных сущностей
 * Используются для единообразного отображения текстов в разных местах приложения
 */

import type { ApiRole, EmployeeRole } from '@/types'
import { normalizeEmployeePosition } from '@/utils/roles'

export type SupplierType = 'products' | 'equipment' | 'services' | 'logistics'
export const SUPPLIER_TYPE_LABELS = {
  products: 'Товары',
  equipment: 'Оборудование',
  services: 'Услуги',
  logistics: 'Логистика',
} as const satisfies Record<SupplierType, string>

export const SUPPLIER_TYPE_DESCRIPTIONS = {
  products: 'Поставка продуктов питания и товаров',
  equipment: 'Поставка оборудования для заведений',
  services: 'Предоставление услуг для ресторанов',
  logistics: 'Логистические и транспортные услуги',
} as const satisfies Record<SupplierType, string>

export type RestaurantFormat =
  | 'full_service'
  | 'cafe'
  | 'sushi_bar'
  | 'bistro'
  | 'fast_food'
  | 'bar'
  | 'pizzeria'
  | 'bakery'
  | 'food_truck'
  | 'catering'

export const RESTAURANT_FORMAT_LABELS = {
  full_service: 'Полный сервис',
  cafe: 'Кафе',
  sushi_bar: 'Суши-бар',
  bistro: 'Бистро',
  fast_food: 'Фастфуд',
  bar: 'Бар',
  pizzeria: 'Пиццерия',
  bakery: 'Пекарня',
  food_truck: 'Фудтрак',
  catering: 'Кейтеринг',
} as const satisfies Record<RestaurantFormat, string>

export const RESTAURANT_FORMAT_DESCRIPTIONS = {
  full_service: 'Ресторан с полным обслуживанием',
  cafe: 'Кафе с легкими закусками и напитками',
  sushi_bar: 'Суши-бар с японской кухней',
  bistro: 'Бистро с быстрым обслуживанием',
  fast_food: 'Фастфуд с быстрым обслуживанием',
  bar: 'Бар с напитками и закусками',
  pizzeria: 'Пиццерия с итальянской кухней',
  bakery: 'Пекарня со свежей выпечкой',
  food_truck: 'Фудтрак с мобильным обслуживанием',
  catering: 'Кейтеринг для мероприятий',
} as const satisfies Record<RestaurantFormat, string>

export const EMPLOYEE_POSITION_LABELS = {
  chef: 'Повар',
  waiter: 'Официант',
  bartender: 'Бармен',
  barista: 'Бариста',
  delivery: 'Доставка',
  manager: 'Менеджер',
  support: 'Поддержка',
  admin: 'Администратор',
} as const satisfies Record<EmployeeRole, string>

/**
 * Описания позиций сотрудников
 */
export const EMPLOYEE_POSITION_DESCRIPTIONS: Record<EmployeeRole, string> = {
  chef: 'Готовлю блюда и управляю кухней',
  waiter: 'Обслуживаю гостей в зале',
  bartender: 'Готовлю напитки и коктейли',
  barista: 'Готовлю кофе и кофейные напитки',
  delivery: 'Доставляю заказы гостям',
  manager: 'Управляю заведением и персоналом',
  support: 'Оказываю техническую поддержку',
  admin: 'Управляю заведением и персоналом',
} as const

export const USER_ROLE_LABELS = {
  employee: 'Сотрудник',
  restaurant: 'Заведение',
  supplier: 'Поставщик',
} as const satisfies Record<Exclude<ApiRole, 'unverified'>, string>

/**
 * Названия специализаций сотрудников
 */
export const SPECIALIZATION_LABELS = {
  // Manager специализации
  general_manager: 'Генеральный менеджер',
  restaurant_manager: 'Менеджер ресторана',
  kitchen_manager: 'Менеджер кухни',
  bar_manager: 'Менеджер бара',
  shift_supervisor: 'Супервайзер смены',

  // Bartender специализации
  head_bartender: 'Старший бармен',
  mixologist: 'Миксолог',
  bar_back: 'Помощник бармена',
  sommelier: 'Сомелье',

  // Chef специализации
  executive_chef: 'Шеф-повар',
  sous_chef: 'Су-шеф',
  chef_de_partie: 'Шеф де парти',
  line_cook: 'Повар линии',
  prep_cook: 'Заготовщик',
  sushi_chef: 'Сушист',
  pastry_chef: 'Кондитер',
  baker: 'Пекарь',
  butcher: 'Мясник',
  fish_cook: 'Повар рыбного цеха',
  grill_cook: 'Повар гриля',
  cold_station_cook: 'Повар холодного цеха',
  hot_station_cook: 'Повар горячего цеха',
  pizza_maker: 'Пиццайоло',
  shawarma_cook: 'Шаурмист',
  universal_cook: 'Повар-универсал',

  // Waiter специализации
  head_waiter: 'Старший официант',
  server: 'Официант',
  runner: 'Официант-курьер',
  busser: 'Помощник официанта',

  // Barista специализации
  head_barista: 'Старший бариста',
  latte_artist: 'Латте-артист',
  roaster: 'Обжарщик',
  tea_master: 'Чайный мастер',

  // Dishwasher специализации
  dishwasher: 'Мойщик посуды',
  cleaner: 'Уборщик',
  janitor: 'Дворник',
  steward: 'Стюард',
  // Bartender дополнительные специализации
  hookah_master: 'Кальянный мастер',
  // Delivery специализации
  courier: 'Курьер',
} as const

export type SpecializationKey = keyof typeof SPECIALIZATION_LABELS

/**
 * Утилитарные функции для получения названий
 */

/**
 * Получить название типа поставщика
 */
export const getSupplierTypeLabel = (value: string): string => {
  return SUPPLIER_TYPE_LABELS[value as SupplierType] || value
}

/**
 * Получить описание типа поставщика
 */
export const getSupplierTypeDescription = (value: string): string => {
  return SUPPLIER_TYPE_DESCRIPTIONS[value as SupplierType] || ''
}

/**
 * Получить название формата ресторана
 */
export const getRestaurantFormatLabel = (value: string): string => {
  return RESTAURANT_FORMAT_LABELS[value as RestaurantFormat] || value
}

/**
 * Получить описание формата ресторана
 */
export const getRestaurantFormatDescription = (value: string): string => {
  return RESTAURANT_FORMAT_DESCRIPTIONS[value as RestaurantFormat] || ''
}

/**
 * Получить название позиции сотрудника
 */
export const getEmployeePositionLabel = (value: string): string => {
  const key = normalizeEmployeePosition(value)
  return key ? EMPLOYEE_POSITION_LABELS[key] : value
}

/**
 * Получить описание позиции сотрудника
 */
export const getEmployeePositionDescription = (value: string): string => {
  const key = normalizeEmployeePosition(value)
  return key ? EMPLOYEE_POSITION_DESCRIPTIONS[key] : ''
}

/**
 * Получить название роли пользователя
 */
export const getUiRoleLabel = (value: string): string => {
  return USER_ROLE_LABELS[value as Exclude<ApiRole, 'unverified'>] || value
}

/**
 * Получить название специализации
 */
export const getSpecializationLabel = (value: string): string => {
  return SPECIALIZATION_LABELS[value as SpecializationKey] || value
}
