import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useCancelApplicationMutation } from '@/services/api/shiftsApi'
import { mapVacancyToCardShift } from '@/features/feed/model/utils/mapping'
import { VacancyCardWithDetails } from './VacancyCardWithDetails'

interface AppliedShiftCardProps {
  shift: VacancyApiItem
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export const AppliedShiftCard = ({ shift, showToast }: AppliedShiftCardProps) => {
  const { t } = useTranslation()
  const [cancelApplication, { isLoading: isCancelling }] = useCancelApplicationMutation()

  const applicationId = shift.my_application?.id ?? null

  const cancel = useCallback(
    async (appId?: number | null) => {
      if (!appId) return
      try {
        await cancelApplication(appId).unwrap()
        showToast(t('shift.applicationCancelled'), 'success')
      } catch {
        showToast(t('shift.cancelApplicationError'), 'error')
      }
    },
    [cancelApplication, showToast, t]
  )

  return (
    <VacancyCardWithDetails
      vacancy={shift}
      mapToShift={mapVacancyToCardShift}
      feedCardProps={{
        applicationStatus: shift.my_application?.status ?? shift.status ?? null,
      }}
      detailsProps={{
        applicationId,
        onApply: async () => {
          showToast(t('shift.applyNotAvailable'), 'info')
        },
        isApplied: Boolean(applicationId),
        onCancel: async appId => {
          await cancel(appId ?? applicationId)
        },
        isLoading: isCancelling,
      }}
    />
  )
}
