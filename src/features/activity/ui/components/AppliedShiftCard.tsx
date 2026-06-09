import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useShiftApplication } from '@/shared/shifts/useShiftApplication'
import { mapVacancyToCardShift } from '@/shared/shifts/mapping'
import { VacancyCardWithDetails } from './VacancyCardWithDetails'
import { useToast } from '@/shared/lib/hooks/useToast'

interface AppliedShiftCardProps {
  shift: VacancyApiItem
}

export const AppliedShiftCard = ({ shift }: AppliedShiftCardProps) => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { cancel, isCancelling } = useShiftApplication()

  const applicationId = shift.my_application?.id ?? null

  const handleCancel = useCallback(
    async (appId?: number | null) => {
      await cancel(appId ?? applicationId)
    },
    [applicationId, cancel]
  )

  return (
    <VacancyCardWithDetails
      vacancy={shift}
      mapToShift={mapVacancyToCardShift}
      detailsProps={{
        applicationId,
        onApply: async () => {
          showToast(t('shift.applyNotAvailable'), 'warning')
        },
        isApplied: Boolean(applicationId),
        onCancel: handleCancel,
        isLoading: isCancelling,
      }}
    />
  )
}
