import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
} from '@/services/api/shiftsApi'
import { useToast } from '@/shared/lib/hooks/useToast'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'

/** Actions-слой: accept/reject заявки (мутации + тосты + loading-состояния). */
export const useStaffApplicationActions = () => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [acceptApplication, { isLoading: isAccepting }] = useAcceptApplicationMutation()
  const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation()
  const [acceptingApplicationId, setAcceptingApplicationId] = useState<number | null>(null)

  const handleAccept = useCallback(
    async (applicationId: number, shiftId: number) => {
      try {
        setAcceptingApplicationId(applicationId)
        await acceptApplication({
          applicationId,
          shiftId: shiftId > 0 ? shiftId : undefined,
        }).unwrap()
        showToast(t('venueUi.staff.accepted', { defaultValue: 'Сотрудник принят' }), 'success')
        return true
      } catch (error) {
        const errorMessage = getErrorMessage(error)
        const isShiftClosedError = errorMessage
          ?.toLowerCase()
          .includes('shift is not open for accepting applications')

        if (isShiftClosedError) {
          showToast(
            t('venueUi.staff.acceptClosedError', {
              defaultValue: 'Смена уже закрыта для принятия откликов',
            }),
            'warning'
          )
          return false
        }

        showToast(
          errorMessage ??
            t('venueUi.staff.acceptError', { defaultValue: 'Не удалось принять заявку' }),
          'error'
        )
        return false
      } finally {
        setAcceptingApplicationId(null)
      }
    },
    [acceptApplication, showToast, t]
  )

  const handleReject = useCallback(
    async (applicationId: number, shiftId: number) => {
      try {
        await rejectApplication({
          applicationId,
          shiftId: shiftId > 0 ? shiftId : undefined,
        }).unwrap()
        showToast(t('venueUi.staff.rejected', { defaultValue: 'Заявка отклонена' }), 'warning')
        return true
      } catch (error) {
        showToast(
          getErrorMessage(error) ??
            t('venueUi.staff.rejectError', { defaultValue: 'Не удалось отклонить заявку' }),
          'error'
        )
        return false
      }
    },
    [rejectApplication, showToast, t]
  )

  return { handleAccept, handleReject, isAccepting, isRejecting, acceptingApplicationId }
}
