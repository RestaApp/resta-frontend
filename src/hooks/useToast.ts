/**
 * Хук для управления Toast уведомлениями
 * Предоставляет простой API для показа и скрытия уведомлений
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ToastType } from '../components/ui/toast'

interface ToastState {
  message: string
  type: ToastType
  isVisible: boolean
}

interface UseToastReturn {
  toast: ToastState
  showToast: (message: string, type?: ToastType, duration?: number) => void
  hideToast: () => void
}

const DEFAULT_DURATION = 3000

export const useToast = (): UseToastReturn => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false,
  })

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = DEFAULT_DURATION) => {
      // Очищаем предыдущий таймер, если есть
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setToast({
        message,
        type,
        isVisible: true,
      })

      // Автоматически скрываем через указанное время
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          hideToast()
        }, duration)
      }
    },
    [hideToast]
  )

  // Очищаем таймер при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    toast,
    showToast,
    hideToast,
  }
}
