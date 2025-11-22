/**
 * Хук для автоматической авторизации через Telegram
 */

import { useEffect } from 'react'
import { useAuthTelegramMutation } from '../services/api/authApi'
import { getTelegramInitData, isTelegramWebApp } from '../utils/telegram'
import { authService } from '../services/auth'

/**
 * Хук для автоматической авторизации при загрузке приложения
 * Авторизует пользователя через Telegram initData, если он еще не авторизован
 */
export function useAuth() {
  const [authTelegram, { isLoading, isError, error }] = useAuthTelegramMutation()

  useEffect(() => {
    // Авторизуем только если:
    // 1. Пользователь в Telegram Web App
    // 2. Пользователь еще не авторизован
    // 3. Есть initData
    if (!isTelegramWebApp() || authService.isAuthenticated()) {
      return
    }

    const initData = getTelegramInitData()
    if (!initData) {
      console.warn('initData не найден в Telegram Web App')
      return
    }

    console.log('Используем initData для авторизации:', initData)

    // Выполняем авторизацию
    authTelegram({ initData })
      .then(result => {
        console.log('Авторизация успешна:', result)
      })
      .catch(err => {
        console.error('Ошибка авторизации через Telegram:', err)
      })
  }, [authTelegram])

  return {
    isLoading,
    isError,
    error,
  }
}
