import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useApplyToShiftMutation, useCancelApplicationMutation } from '@/services/api/shiftsApi'
import { useToast } from '@/hooks/useToast'
import { triggerHapticFeedback } from '@/utils/haptics'
import { normalizeApiError } from '../utils/apiErrors'

export const useShiftApplication = () => {
  const { t } = useTranslation()
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

        showToast(result.message ?? t('feed.applicationSentSuccess'), 'success')
        return result
      } catch (e) {
        const err = normalizeApiError(e, t('errors.applyError'), t)
        showToast(err.message, 'error')
        throw err
      }
    },
    [applyToShift, showToast, t]
  )

  const cancel = useCallback(
    async (applicationId: number | null | undefined) => {
      if (!applicationId) {
        showToast(t('shift.cancelApplicationError'), 'error')
        throw { kind: 'generic' as const, message: t('shift.cancelApplicationError') }
      }

      try {
        const result = await cancelApplication(applicationId).unwrap()
        showToast(result.message ?? t('shift.applicationCancelled'), 'success')
        return result
      } catch (e) {
        const err = normalizeApiError(e, t('shift.cancelApplicationError'), t)
        showToast(err.message, 'error')
        throw err
      }
    },
    [cancelApplication, showToast, t]
  )

  return { apply, cancel }
}
