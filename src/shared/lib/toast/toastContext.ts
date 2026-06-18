import { createContext, useContext } from 'react'
import type { ToastType } from '@/components/ui/toast'

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export const useToastContext = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
