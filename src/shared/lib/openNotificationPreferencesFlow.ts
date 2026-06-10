import type { AppDispatch } from '@/store'
import { navigateToTab } from '@/features/navigation/model/navigationSlice'
import { setLocalStorageItem } from '@/shared/utils/localStorage'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'

/**
 * Переход на вкладку профиля и открытие настроек уведомлений.
 */
export function openNotificationPreferencesFlow(dispatch: AppDispatch) {
  setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_NOTIFICATION_PREFERENCES, 'true')
  dispatch(navigateToTab('profile'))
  queueMicrotask(() => {
    emitAppEvent(APP_EVENTS.OPEN_NOTIFICATION_PREFERENCES)
  })
}
