/**
 * Центральный файл для регистрации всех API endpoints
 * Импорт этого файла гарантирует, что все endpoints будут зарегистрированы в RTK Query
 */

// Импортируем все API endpoints для их регистрации
import './authApi'
import './shiftsApi'
import './rolesApi'
import './usersApi'
import './notificationPreferencesApi'
import './supportTicketsApi'

// Экспортируем только типы (хуки экспортируются из hooks/)
export type * from './authApi'
export type * from './shiftsApi'
export type * from './rolesApi'
export type * from './usersApi'
export type * from './notificationPreferencesApi'
export type * from './supportTicketsApi'

// Экспортируем общие типы для переиспользования
export type { UserApi, RestaurantProfileApi } from './shiftsApi'
