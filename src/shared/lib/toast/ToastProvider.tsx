import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastViewport, type ToastItem, type ToastType } from '@/components/ui/toast'
import { triggerHapticFeedback, type HapticFeedbackPattern } from '@/shared/utils/haptics'
import { ToastContext, type ToastContextValue } from './toastContext'

const DEFAULT_DURATION = 3000
const MAX_VISIBLE = 3

const TOAST_HAPTIC_MAP: Record<ToastType, HapticFeedbackPattern> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'light',
}

/**
 * Глобальная очередь тостов: до {@link MAX_VISIBLE} видимых одновременно,
 * каждый со своим авто-таймером. Заменяет прежний локальный per-screen toast,
 * где сообщения затирали друг друга.
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(item => item.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = DEFAULT_DURATION) => {
      triggerHapticFeedback(TOAST_HAPTIC_MAP[type])
      const id = (idRef.current += 1)

      setToasts(prev => {
        const next = [...prev, { id, message, type }]
        // Сбрасываем таймеры вытесненных тостов (когда упираемся в лимит).
        if (next.length > MAX_VISIBLE) {
          for (const dropped of next.slice(0, next.length - MAX_VISIBLE)) {
            const timer = timersRef.current.get(dropped.id)
            if (timer) {
              clearTimeout(timer)
              timersRef.current.delete(dropped.id)
            }
          }
        }
        return next.slice(-MAX_VISIBLE)
      })

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration)
        timersRef.current.set(id, timer)
      }
    },
    [dismiss]
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach(timer => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
