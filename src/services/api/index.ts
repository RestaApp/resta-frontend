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
import './notificationsApi'
import './reviewsApi'
import './analyticsApi'
import './subscriptionsApi'
import './purchasesApi'
import './supportTicketsApi'

// Экспортируем только типы (хуки экспортируются из hooks/)
export type * from './authApi'
export type * from './shiftsApi'
export type * from './rolesApi'
export type * from './usersApi'
export type * from './notificationPreferencesApi'
export type * from './notificationsApi'
export type * from './reviewsApi'
export type * from './analyticsApi'
export type * from './subscriptionsApi'
export type * from './purchasesApi'
export type * from './supportTicketsApi'
