/**
 * Утилиты для работы с данными пользователя
 * Вынесены для устранения дублирования логики
 */

import type { AppDispatch } from '@/store'
import { setUserData } from '@/features/navigation/model/userSlice'
import type { UserData } from '@/services/api/authApi'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'

/**
 * Обновляет данные пользователя в Redux store
 * @param dispatch - Redux dispatch функция
 * @param userData - Данные пользователя для сохранения
 */
export const updateUserDataInStore = (dispatch: AppDispatch, userData: UserData | null): void => {
  dispatch(setUserData(userData))
}

/**
 * Отправляет событие об успешной авторизации
 */
export const dispatchAuthEvent = (): void => {
  try {
    emitAppEvent(APP_EVENTS.AUTH_AUTHORIZED)
  } catch {
    // Игнорируем ошибки при отправке события
  }
}
