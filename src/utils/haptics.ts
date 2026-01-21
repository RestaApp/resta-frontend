/**
 * Утилита для тактильной обратной связи
 */

import { getTelegramWebApp } from './telegram'

/**
 * Маппинг стилей вибрации на длительность в миллисекундах
 */
const HAPTIC_DURATION_MAP: Record<'light' | 'medium' | 'heavy', number> = {
  light: 50,
  medium: 100,
  heavy: 200,
}

/**
 * Выполняет тактильную обратную связь
 * @param style - Стиль вибрации ('light' | 'medium' | 'heavy')
 */
export const triggerHapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light'): void => {
  const webApp = getTelegramWebApp()
  const duration = HAPTIC_DURATION_MAP[style]
  
  if (webApp?.HapticFeedback) {
    try {
      webApp.HapticFeedback.impactOccurred(style)
      return
    } catch {
      // Fallback на нативный API при ошибке Telegram API
    }
  }
  
  // Fallback на нативный API вибрации
  if (navigator.vibrate) {
    navigator.vibrate(duration)
  }
}

/**
 * Утилита для тактильной обратной связи
 * @deprecated Используйте triggerHapticFeedback напрямую. Это не React хук.
 */
export const useHaptics = () => {
  return {
    trigger: triggerHapticFeedback,
  }
}

