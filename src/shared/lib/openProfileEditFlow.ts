import type { AppDispatch } from '@/store'
import { navigateToTab } from '@/features/navigation/model/navigationSlice'
import { setLocalStorageItem } from '@/shared/utils/localStorage'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'

/**
 * Переход на вкладку профиля и открытие формы редактирования.
 * Событие `openProfileEdit` шлём в microtask, чтобы слушатель в ProfilePage успел подписаться после монтирования.
 */
export function openProfileEditFlow(dispatch: AppDispatch) {
  setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT, 'true')
  dispatch(navigateToTab('profile'))
  queueMicrotask(() => {
    emitAppEvent(APP_EVENTS.OPEN_PROFILE_EDIT)
  })
}
