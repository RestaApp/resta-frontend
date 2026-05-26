import { getTelegramWebApp } from './telegram'

export type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
export type HapticNotificationType = 'success' | 'warning' | 'error'
export type HapticFeedbackPattern = HapticImpactStyle | HapticNotificationType | 'selection'

type NativeVibrationPattern = number | number[]

const HAPTIC_DURATION_MAP: Record<HapticImpactStyle, NativeVibrationPattern> = {
  light: 50,
  medium: 100,
  heavy: 200,
  rigid: 80,
  soft: 35,
}

const NOTIFICATION_FALLBACK_MAP: Record<HapticNotificationType, NativeVibrationPattern> = {
  success: [35, 25, 35],
  warning: [60, 35, 60],
  error: [90, 40, 90, 40, 120],
}

const NOTIFICATION_IMPACT_FALLBACK: Record<HapticNotificationType, HapticImpactStyle> = {
  success: 'medium',
  warning: 'heavy',
  error: 'heavy',
}

const isNotificationPattern = (pattern: HapticFeedbackPattern): pattern is HapticNotificationType =>
  pattern === 'success' || pattern === 'warning' || pattern === 'error'

const runNativeVibration = (pattern: NativeVibrationPattern): void => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  navigator.vibrate(pattern)
}

/**
 * Выполняет тактильную обратную связь Telegram с native fallback для браузера.
 */
export const triggerHapticFeedback = (pattern: HapticFeedbackPattern = 'light'): void => {
  const webApp = getTelegramWebApp()

  if (webApp?.HapticFeedback) {
    try {
      if (pattern === 'selection') {
        if (webApp.HapticFeedback.selectionChanged) {
          webApp.HapticFeedback.selectionChanged()
          return
        }
        webApp.HapticFeedback.impactOccurred('light')
        return
      }

      if (isNotificationPattern(pattern)) {
        if (webApp.HapticFeedback.notificationOccurred) {
          webApp.HapticFeedback.notificationOccurred(pattern)
          return
        }
        webApp.HapticFeedback.impactOccurred(NOTIFICATION_IMPACT_FALLBACK[pattern])
        return
      }

      webApp.HapticFeedback.impactOccurred(pattern)
      return
    } catch {
      // Fallback на нативный API при ошибке Telegram API
    }
  }

  if (pattern === 'selection') {
    runNativeVibration(15)
    return
  }

  runNativeVibration(
    isNotificationPattern(pattern)
      ? NOTIFICATION_FALLBACK_MAP[pattern]
      : HAPTIC_DURATION_MAP[pattern]
  )
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
