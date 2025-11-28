/**
 * Центральный файл для регистрации всех API endpoints
 * Импорт этого файла гарантирует, что все endpoints будут зарегистрированы в RTK Query
 */

// Импортируем все API endpoints для их регистрации
import './authApi'
import './shiftsApi'
import './rolesApi'
import './usersApi'

// Экспортируем только типы (хуки экспортируются из hooks/)
export type * from './authApi'
export type * from './shiftsApi'
export type * from './rolesApi'
export type * from './usersApi'
