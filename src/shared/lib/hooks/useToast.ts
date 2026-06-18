/**
 * Хук для показа Toast-уведомлений.
 * Делегирует в глобальный ToastProvider — тосты ставятся в общую очередь
 * (до 3 одновременно) и не затирают друг друга между экранами.
 */

import { useToastContext } from '@/shared/lib/toast/toastContext'

export const useToast = () => {
  const { showToast } = useToastContext()
  return { showToast }
}
