/**
 * Утилиты для работы с данными пользователя
 * Вынесены для устранения дублирования логики
 */

import type { AppDispatch } from '../store'
import { setUserData } from '../store/userSlice'
import type { UserData } from '../services/api/authApi'
import { logger } from './logger'

/**
 * Обновляет данные пользователя в Redux store
 * @param dispatch - Redux dispatch функция
 * @param userData - Данные пользователя для сохранения
 */
export function updateUserDataInStore(dispatch: AppDispatch, userData: UserData | null): void {
  logger.log('[updateUserDataInStore] Сохранение userData в Redux:', {
    id: userData?.id,
    role: userData?.role,
    full_name: userData?.full_name,
  })
  dispatch(setUserData(userData))
  logger.log('[updateUserDataInStore] userData сохранен в Redux (redux-persist автоматически сохранит в sessionStorage)')
}

/**
 * Инвалидирует кэш пользователя в RTK Query
 * @param dispatch - Redux dispatch функция
 */
export function invalidateUserCache(dispatch: AppDispatch): void {
  // Используем прямой импорт через динамический для избежания циклических зависимостей
  // при инициализации модулей
  import('../store/api').then(({ api }) => {
    dispatch(api.util.invalidateTags(['User']))
  }).catch(() => {
    // Игнорируем ошибки импорта
  })
}

/**
 * Отправляет событие об успешной авторизации
 */
export function dispatchAuthEvent(): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('auth:authorized'))
    } catch {
      // Игнорируем ошибки при отправке события
    }
  }
}

