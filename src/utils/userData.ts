/**
 * Утилиты для работы с данными пользователя
 * Вынесены для устранения дублирования логики
 */

import type { AppDispatch } from '@/store'
import { setUserData } from '@/store/userSlice'
import type { UserData } from '@/services/api/authApi'

/**
 * Обновляет данные пользователя в Redux store
 * @param dispatch - Redux dispatch функция
 * @param userData - Данные пользователя для сохранения
 */
export const updateUserDataInStore = (dispatch: AppDispatch, userData: UserData | null): void => {
  dispatch(setUserData(userData))
}

/**
 * Инвалидирует кэш пользователя в RTK Query
 * @param dispatch - Redux dispatch функция
 */
export const invalidateUserCache = (dispatch: AppDispatch): void => {
  // Используем прямой импорт через динамический для избежания циклических зависимостей
  // при инициализации модулей
  import('@/store/api')
    .then(({ api }) => {
      dispatch(api.util.invalidateTags(['User']))
    })
    .catch(() => {
      // Игнорируем ошибки импорта
    })
}

/**
 * Отправляет событие об успешной авторизации
 */
export const dispatchAuthEvent = (): void => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('auth:authorized'))
    } catch {
      // Игнорируем ошибки при отправке события
    }
  }
}
