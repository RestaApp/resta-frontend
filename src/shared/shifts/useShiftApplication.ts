import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useApplyToShiftMutation, useCancelApplicationMutation } from '@/services/api/shiftsApi'
import { useToast } from '@/shared/lib/hooks/useToast'
import { normalizeApiError } from '@/shared/utils/apiErrors'

interface UseShiftApplicationOptions {
  /** Отключается в flow, где успешный отклик уже подтверждается отдельным экраном. */
  showApplySuccessToast?: boolean
}

export const useShiftApplication = ({
  showApplySuccessToast = true,
}: UseShiftApplicationOptions = {}) => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [applyToShift, { isLoading: isApplying }] = useApplyToShiftMutation()
  const [cancelApplication, { isLoading: isCancelling }] = useCancelApplicationMutation()

  const apply = useCallback(
    async (shiftId: number, message?: string) => {
      try {
        const result = await applyToShift({
          id: shiftId,
          data: message ? { message } : undefined,
        }).unwrap()

        if (showApplySuccessToast) {
          showToast(result.message ?? t('feed.applicationSentSuccess'), 'success')
        }
        return result
      } catch (e) {
        const err = normalizeApiError(e, t('errors.applyError'), t)
        showToast(err.message, 'error')
        throw err
      }
    },
    [applyToShift, showApplySuccessToast, showToast, t]
  )

  const cancel = useCallback(
    async (applicationId: number | null | undefined, shiftId?: number) => {
      if (!applicationId) {
        showToast(t('shift.cancelApplicationError'), 'error')
        throw { kind: 'generic' as const, message: t('shift.cancelApplicationError') }
      }

      try {
        const result = await cancelApplication({ applicationId, shiftId }).unwrap()
        showToast(result.message ?? t('shift.applicationCancelled'), 'warning')
        return result
      } catch (e) {
        const err = normalizeApiError(e, t('shift.cancelApplicationError'), t)
        showToast(err.message, 'error')
        throw err
      }
    },
    [cancelApplication, showToast, t]
  )

  return { apply, cancel, isApplying, isCancelling }
}
