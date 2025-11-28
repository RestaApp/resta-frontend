/**
 * Хук для автоматической авторизации через Telegram
 */

import { useEffect, useRef } from 'react'
import { useAuthTelegramMutation } from '../services/api/authApi'
import { getTelegramInitData, isTelegramWebApp } from '../utils/telegram'
import { authService } from '../services/auth'
import { logger } from '../utils/logger'

/**
 * Хук для автоматической авторизации при загрузке приложения
 * Авторизует пользователя через Telegram initData, если он еще не авторизован
 */
export function useAuth() {
  const [authTelegram, { isLoading, isError, error }] = useAuthTelegramMutation()
  const hasAttemptedAuth = useRef(false)

  useEffect(() => {
    // Предотвращаем повторные попытки авторизации
    if (hasAttemptedAuth.current || isLoading) {
      return
    }

    // Авторизуем только если пользователь еще не авторизован
    if (authService.isAuthenticated()) {
      return
    }

    // В режиме разработки авторизуем даже без Telegram Web App
    // В production авторизуем только в Telegram Web App
    if (!import.meta.env.DEV && !isTelegramWebApp()) {
      return
    }

    const initData = getTelegramInitData()
    if (!initData) {
      logger.warn('initData не найден')
      return
    }

    // Помечаем, что попытка авторизации была сделана
    hasAttemptedAuth.current = true

    logger.log('Используем initData для авторизации:', initData)

    // Выполняем авторизацию
    authTelegram({ initData })
      .then(result => {
        logger.log('Авторизация успешна:', result)
      })
      .catch(err => {
        logger.error('Ошибка авторизации через Telegram:', err)
        // Сбрасываем флаг при ошибке, чтобы можно было повторить попытку
        hasAttemptedAuth.current = false
      })
  }, [authTelegram, isLoading])

  return {
    isLoading,
    isError,
    error,
  }
}
