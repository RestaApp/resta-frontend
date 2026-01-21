import { useCallback } from 'react'
import { useApplyToShiftMutation, useCancelApplicationMutation } from '@/services/api/shiftsApi'
import { useToast } from '@/hooks/useToast'
import { triggerHapticFeedback } from '@/utils/haptics'
import { normalizeApiError } from '../utils/apiErrors'

export const useShiftApplication = () => {
  const { showToast } = useToast()
  const [applyToShift] = useApplyToShiftMutation()
  const [cancelApplication] = useCancelApplicationMutation()

  const apply = useCallback(
    async (shiftId: number, message?: string) => {
      try {
        triggerHapticFeedback('light')

        const result = await applyToShift({
          id: shiftId,
          data: message ? { message } : undefined,
        }).unwrap()

        showToast(result.message || 'Заявка отправлена. Если вас утвердят, бот пришлет сообщение.', 'success')
        return result
      } catch (e) {
        // ВАЖНО: не решаем UI модалки тут, только нормализуем для верхнего уровня
        const err = normalizeApiError(e, 'Не удалось отправить заявку')
        showToast(err.message, 'error')
        throw err
      }
    },
    [applyToShift, showToast]
  )

  const cancel = useCallback(
    async (applicationId: number | null | undefined) => {
      if (!applicationId) {
        const err = { kind: 'generic' as const, message: 'Не удалось отменить заявку: неизвестный id' }
        showToast(err.message, 'error')
        throw err
      }

      try {
        const result = await cancelApplication(applicationId).unwrap()
        showToast(result.message || 'Заявка отменена', 'success')
        return result
      } catch (e) {
        const err = normalizeApiError(e, 'Не удалось отменить заявку')
        showToast(err.message, 'error')
        throw err
      }
    },
    [cancelApplication, showToast]
  )

  return { apply, cancel }
}
