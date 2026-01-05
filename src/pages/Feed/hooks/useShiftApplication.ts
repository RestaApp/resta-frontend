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
        async (shiftId: number) => {
            try {
                const result = await cancelApplication(shiftId).unwrap()

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
