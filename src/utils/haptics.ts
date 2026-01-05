/**
 * Утилита для тактильной обратной связи
 */

import { getTelegramWebApp } from './telegram'

/**
 * Выполняет тактильную обратную связь
 * @param style - Стиль вибрации ('light' | 'medium' | 'heavy')
 */
export const triggerHapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light'): void => {
  const webApp = getTelegramWebApp()
  
  if (webApp?.HapticFeedback) {
    try {
      webApp.HapticFeedback.impactOccurred(style)
    } catch {
      // Fallback на нативный API
      if (navigator.vibrate) {
        const duration = style === 'light' ? 50 : style === 'medium' ? 100 : 200
        navigator.vibrate(duration)
      }
    }
  } else if (navigator.vibrate) {
    const duration = style === 'light' ? 50 : style === 'medium' ? 100 : 200
    navigator.vibrate(duration)
  }
}

/**
 * Хук для тактильной обратной связи
 */
export const useHaptics = () => {
  return {
    trigger: triggerHapticFeedback,
  }
}

