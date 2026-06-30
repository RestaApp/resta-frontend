import { useEffect, useState } from 'react'
import { getLocalStorageItem, removeLocalStorageItem } from '@/shared/utils/localStorage'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'

/** UI-state слой профиля: открытость дроверов (редактирование / настройки уведомлений). */
export const useProfileDrawersState = () => {
  // legacy: открыть дровер редактирования по одноразовому localStorage-флагу.
  // Чтение — в lazy-инициализаторе (один раз), очистка — в commit-фазе ниже:
  // нельзя трогать localStorage во время рендера (render purity / StrictMode
  // дважды вызывает инициализатор и съел бы флаг до открытия дровера).
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(
    () => getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT) === 'true'
  )
  const [isNotificationPrefsDrawerOpen, setIsNotificationPrefsDrawerOpen] = useState(false)

  // Гасим одноразовый флаг после монтирования (идемпотентно — remove отсутствующего ключа безопасен).
  useEffect(() => {
    removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT)
  }, [])

  // legacy: open drawer by window event
  useEffect(() => {
    return onAppEvent(APP_EVENTS.OPEN_PROFILE_EDIT, () => {
      setIsEditDrawerOpen(true)
    })
  }, [])

  return {
    isEditDrawerOpen,
    setIsEditDrawerOpen,
    isNotificationPrefsDrawerOpen,
    setIsNotificationPrefsDrawerOpen,
  }
}
