/**
 * Константы с переводами и названиями для различных сущностей
 * Используются для единообразного отображения текстов в разных местах приложения
 */

/**
 * Названия типов поставщиков
 */
export const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  products: 'Товары',
  equipment: 'Оборудование',
  services: 'Услуги',
  logistics: 'Логистика',
} as const

/**
 * Описания типов поставщиков
 */
export const SUPPLIER_TYPE_DESCRIPTIONS: Record<string, string> = {
  products: 'Поставка продуктов питания и товаров',
  equipment: 'Поставка оборудования для заведений',
  services: 'Предоставление услуг для ресторанов',
  logistics: 'Логистические и транспортные услуги',
} as const

/**
 * Названия форматов ресторанов
 */
export const RESTAURANT_FORMAT_LABELS: Record<string, string> = {
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
} as const

/**
 * Описания форматов ресторанов
 */
export const RESTAURANT_FORMAT_DESCRIPTIONS: Record<string, string> = {
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
} as const

/**
 * Названия позиций сотрудников (из API)
 */
export const EMPLOYEE_POSITION_LABELS: Record<string, string> = {
  Chef: 'Повар',
  Waiter: 'Официант',
  Bartender: 'Бармен',
  Barista: 'Бариста',
  Manager: 'Менеджер',
  Support: 'Поддержка',
  // Также поддерживаем lowercase варианты
  chef: 'Повар',
  waiter: 'Официант',
  bartender: 'Бармен',
  barista: 'Бариста',
  manager: 'Менеджер',
  support: 'Поддержка',
} as const

/**
 * Описания позиций сотрудников
 */
export const EMPLOYEE_POSITION_DESCRIPTIONS: Record<string, string> = {
  chef: 'Готовлю блюда и управляю кухней',
  waiter: 'Обслуживаю гостей в зале',
  bartender: 'Готовлю напитки и коктейли',
  barista: 'Готовлю кофе и кофейные напитки',
  manager: 'Управляю заведением и персоналом',
  support: 'Оказываю техническую поддержку',
} as const

/**
 * Названия основных ролей (из API)
 */
export const USER_ROLE_LABELS: Record<string, string> = {
  employee: 'Сотрудник',
  restaurant: 'Заведение',
  supplier: 'Поставщик',
} as const

/**
 * Названия специализаций сотрудников
 */
export const SPECIALIZATION_LABELS: Record<string, string> = {
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
  prep_cook: 'Повар подготовки',
  sushi_chef: 'Суши-повар',
  pastry_chef: 'Кондитер',
  baker: 'Пекарь',
  butcher: 'Мясник',
  fish_cook: 'Рыбный повар',
  grill_cook: 'Повар гриля',
  cold_station_cook: 'Повар холодного цеха',
  hot_station_cook: 'Повар горячего цеха',
  pizza_maker: 'Пиццайоло',
  
  // Waiter специализации
  head_waiter: 'Старший официант',
  server: 'Официант',
  runner: 'Официант-курьер',
  busser: 'Помощник официанта',
  
  // Barista специализации
  head_barista: 'Старший бариста',
  latte_artist: 'Латте-артист',
  roaster: 'Обжарщик',
  
  // Dishwasher специализации
  dishwasher: 'Мойщик посуды',
  cleaner: 'Уборщик',
  janitor: 'Дворник',
  steward: 'Стюард',
} as const

/**
 * Утилитарные функции для получения названий
 */

/**
 * Получить название типа поставщика
 */
export function getSupplierTypeLabel(value: string): string {
  return SUPPLIER_TYPE_LABELS[value] || value
}

/**
 * Получить описание типа поставщика
 */
export function getSupplierTypeDescription(value: string): string {
  return SUPPLIER_TYPE_DESCRIPTIONS[value] || ''
}

/**
 * Получить название формата ресторана
 */
export function getRestaurantFormatLabel(value: string): string {
  return RESTAURANT_FORMAT_LABELS[value] || value
}

/**
 * Получить описание формата ресторана
 */
export function getRestaurantFormatDescription(value: string): string {
  return RESTAURANT_FORMAT_DESCRIPTIONS[value] || ''
}

/**
 * Получить название позиции сотрудника
 */
export function getEmployeePositionLabel(value: string): string {
  return EMPLOYEE_POSITION_LABELS[value] || value
}

/**
 * Получить описание позиции сотрудника
 */
export function getEmployeePositionDescription(value: string): string {
  return EMPLOYEE_POSITION_DESCRIPTIONS[value.toLowerCase()] || ''
}

/**
 * Получить название роли пользователя
 */
export function getUserRoleLabel(value: string): string {
  return USER_ROLE_LABELS[value] || value
}

/**
 * Получить название специализации
 */
export function getSpecializationLabel(value: string): string {
  return SPECIALIZATION_LABELS[value] || value
}

