/**
 * Экспорт API для использования в endpoints
 * Этот файл создается отдельно, чтобы избежать циклических зависимостей
 */

import { createApi } from '../config/rtkQuery'

// Создаем и экспортируем API
export const api = createApi()

