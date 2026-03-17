/**
 * Конфигурация Telegram Web App
 */

/**
 * Моковые данные initData для разработки
 * Используется, когда Telegram Web App недоступен (локальная разработка).
 * Задаётся через переменную окружения VITE_MOCK_INIT_DATA (в .env).
 */
export const MOCK_INIT_DATA = import.meta.env.VITE_MOCK_INIT_DATA ?? ''

/**
 * Использовать моковые данные в режиме разработки
 */
export const USE_MOCK_INIT_DATA = import.meta.env.DEV
