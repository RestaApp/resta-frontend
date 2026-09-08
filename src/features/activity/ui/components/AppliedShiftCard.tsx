import { useCallback } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useShiftApplication } from '@/shared/shifts/useShiftApplication'
import { mapVacancyToCardShift } from '@/shared/shifts/mapping'
import { VacancyCardWithDetails } from './VacancyCardWithDetails'
import { isActiveApplicationStatus } from '@/shared/shifts/applicationStatus'

interface AppliedShiftCardProps {
  shift: VacancyApiItem
}

export const AppliedShiftCard = ({ shift }: AppliedShiftCardProps) => {
  const { apply, cancel, isApplying, isCancelling } = useShiftApplication()

  const applicationId = shift.my_application?.id ?? null
  const isApplied = isActiveApplicationStatus(shift.my_application?.status)

  const handleCancel = useCallback(
    async (appId?: number | null) => {
      await cancel(appId ?? applicationId, shift.id)
    },
    [applicationId, cancel, shift.id]
  )

  return (
    <VacancyCardWithDetails
      vacancy={shift}
      mapToShift={mapVacancyToCardShift}
      detailsProps={{
        applicationId,
        onApply: async (shiftId, message) => {
          await apply(shiftId, message)
        },
        isApplied,
        onCancel: handleCancel,
        isLoading: isApplying || isCancelling,
      }}
    />
  )
}
