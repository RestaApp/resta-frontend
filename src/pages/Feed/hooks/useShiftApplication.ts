/**
 * Хук для работы с заявками на смены
 * Инкапсулирует логику отклика и отмены заявок
 */

import { useCallback } from 'react'
import { useApplyToShiftMutation, useCancelApplicationMutation } from '@/services/api/shiftsApi'
import { useToast } from '@/hooks/useToast'
import { getTelegramWebApp } from '@/utils/telegram'

interface UseShiftApplicationOptions {
    onSuccess?: () => void
    onError?: (error: unknown) => void
}

/**
 * Хук для работы с заявками на смены
 */
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
                const webApp = getTelegramWebApp()
                if (webApp?.HapticFeedback) {
                    try {
                        webApp.HapticFeedback.impactOccurred('light')
                    } catch {
                        if (navigator.vibrate) {
                            navigator.vibrate(50)
                        }
                    }
                } else if (navigator.vibrate) {
                    navigator.vibrate(50)
                }

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
                const errorMessage =
                    error && typeof error === 'object' && 'data' in error
                        ? (error.data as { message?: string })?.message || 'Не удалось отправить заявку'
                        : 'Не удалось отправить заявку'
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
                const errorMessage =
                    error && typeof error === 'object' && 'data' in error
                        ? (error.data as { message?: string })?.message || 'Не удалось отменить заявку'
                        : 'Не удалось отменить заявку'
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

