/**
 * Центральный файл для регистрации всех API endpoints
 * Импорт этого файла гарантирует, что все endpoints будут зарегистрированы в RTK Query
 */

// Импортируем все API endpoints для их регистрации
import './authApi'
import './shiftsApi'

// Экспортируем типы и хуки для удобного использования
export * from './authApi'
export * from './shiftsApi'



