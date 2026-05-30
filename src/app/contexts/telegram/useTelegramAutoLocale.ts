import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { getTelegramLanguageCode } from '@/shared/utils/telegram'
import i18n, { telegramCodeToLocale } from '@/shared/i18n/config'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { getLocalStorageItem } from '@/shared/utils/localStorage'

/**
 * Автоопределение локали для **неавторизованного** пользователя:
 * если язык не зафиксирован в `localStorage` — берём язык устройства Telegram.
 */
export const useTelegramAutoLocale = (isReady: boolean): void => {
  const userDataFromStore = useAppSelector(selectUserData)
  const userId = userDataFromStore?.id

  useEffect(() => {
    if (!isReady) return
    if (userId) return

    void (async () => {
      if (!getLocalStorageItem(STORAGE_KEYS.LOCALE)) {
        const code = getTelegramLanguageCode()
        await i18n.changeLanguage(telegramCodeToLocale(code))
      }
    })()
  }, [isReady, userId])
}
