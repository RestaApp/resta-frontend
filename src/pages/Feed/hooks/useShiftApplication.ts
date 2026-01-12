/**
 * Хук для работы с заявками на смены
 * Инкапсулирует логику отклика и отмены заявок
 */

import { useCallback } from 'react'
import { useApplyToShiftMutation, useCancelApplicationMutation } from '@/services/api/shiftsApi'
import { useToast } from '@/hooks/useToast'
import { triggerHapticFeedback } from '@/utils/haptics'

interface UseShiftApplicationOptions {
    onSuccess?: () => void
    onError?: (error: unknown) => void
}

/**
 * Хук для работы с заявками на смены
 */
const getErrorMessage = (error: unknown, fallback: string) => {
    return error && typeof error === 'object' && 'data' in error
        ? (error.data as { message?: string })?.message || fallback
        : fallback
}

export const useShiftApplication = (options: UseShiftApplicationOptions = {}) => {
    const { showToast } = useToast()
    const [applyToShift, { isLoading: isApplying }] = useApplyToShiftMutation()
    const [cancelApplication, { isLoading: isCancelling }] = useCancelApplicationMutation()

    /**
     * Откликнуться на смену
     */
    const apply = useCallback(
        async (shiftId: number, message?: string) => {
            try {
                // Тактильная обратная связь
                triggerHapticFeedback('light')

                const result = await applyToShift({
                    id: shiftId,
                    data: message ? { message } : undefined,
                }).unwrap()

                showToast(
                    result.message || '✅ Заявка отправлена! Если вас утвердят, бот пришлет сообщение.',
                    'success'
                )
                options.onSuccess?.()
                return result
            } catch (error) {
                const errorMessage = getErrorMessage(error, 'Не удалось отправить заявку')
                showToast(errorMessage, 'error')
                options.onError?.(error)
                throw error
            }
        },
        [applyToShift, showToast, options]
    )

    /**
     * Отменить заявку на смену
     */
    const cancel = useCallback(
        async (applicationId: number | null | undefined) => {
            try {
                if (!applicationId) {
                    const err = new Error('application id is required to cancel application')
                    showToast('Не удалось отменить заявку: неизвестный id', 'error')
                    options.onError?.(err)
                    throw err
                }
                const result = await cancelApplication(applicationId).unwrap()

                showToast(result.message || '✅ Заявка отменена', 'success')
                options.onSuccess?.()
                return result
            } catch (error) {
                const errorMessage = getErrorMessage(error, 'Не удалось отменить заявку')
                showToast(errorMessage, 'error')
                options.onError?.(error)
                throw error
            }
        },
        [cancelApplication, showToast, options]
    )

    return {
        apply,
        cancel,
        isApplying,
        isCancelling,
        isLoading: isApplying || isCancelling,
    }
}
