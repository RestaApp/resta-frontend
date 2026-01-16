import { useCallback } from 'react'
import { useApplyToShiftMutation, useCancelApplicationMutation } from '@/services/api/shiftsApi'
import { useToast } from '@/hooks/useToast'
import { triggerHapticFeedback } from '@/utils/haptics'

interface UseShiftApplicationOptions {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string; missing_fields?: string[] } }).data

    // Специальная обработка ответа от API: профиль неполный
    if (data?.message === 'profile_incomplete') {
      const missing: string[] = Array.isArray(data.missing_fields) ? data.missing_fields : []
      const fieldsText = missing.length > 0 ? missing.join(', ') : 'неизвестные поля'
      return `Профиль неполный: отсутствуют поля — ${fieldsText}. Пожалуйста, заполните профиль в настройках.`
    }

    return data?.message || fallback
  }

  return fallback
}

export const useShiftApplication = (options: UseShiftApplicationOptions = {}) => {
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

        showToast(result.message || '✅ Заявка отправлена! Если вас утвердят, бот пришлет сообщение.', 'success')
        options.onSuccess?.()
        return result
      } catch (error) {
        const msg = getErrorMessage(error, 'Не удалось отправить заявку')
        showToast(msg, 'error')
        options.onError?.(error)
        throw error
      }
    },
    [applyToShift, showToast, options]
  )

  const cancel = useCallback(
    async (applicationId: number | null | undefined) => {
      try {
        if (!applicationId) {
          const err = new Error('application id is required')
          showToast('Не удалось отменить заявку: неизвестный id', 'error')
          options.onError?.(err)
          throw err
        }

        const result = await cancelApplication(applicationId).unwrap()
        showToast(result.message || '✅ Заявка отменена', 'success')
        options.onSuccess?.()
        return result
      } catch (error) {
        const msg = getErrorMessage(error, 'Не удалось отменить заявку')
        showToast(msg, 'error')
        options.onError?.(error)
        throw error
      }
    },
    [cancelApplication, showToast, options]
  )

  return { apply, cancel }
}
