import React, { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useCancelApplicationMutation } from '@/services/api/shiftsApi'
import { mapVacancyToCardShift } from '@/features/feed/model/utils/mapping'
import { ShiftCard } from '@/components/ui/ShiftCard'
import { ShiftDetailsScreen } from '@/components/ui/ShiftDetailsScreen'

interface AppliedShiftCardProps {
  shift: VacancyApiItem
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export const AppliedShiftCard: React.FC<AppliedShiftCardProps> = ({ shift, showToast }) => {
  const { t } = useTranslation()
  const [cancelApplication, { isLoading: isCancelling }] = useCancelApplicationMutation()
  const [isOpen, setIsOpen] = useState(false)

  const mappedShift = useMemo(() => mapVacancyToCardShift(shift), [shift])
  const applicationId = mappedShift.applicationId ?? null

  const handleOpenDetails = useCallback(() => setIsOpen(true), [])
  const handleCloseDetails = useCallback(() => setIsOpen(false), [])

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

  const handleCancelFromDetails = useCallback(
    async (appId: number | null | undefined) => {
      await cancel(appId ?? applicationId)
      setIsOpen(false)
    },
    [cancel, applicationId]
  )

  const handleApplyFromDetails = useCallback(async () => {
    showToast(t('shift.applyNotAvailable'), 'info')
    setIsOpen(false)
  }, [showToast, t])

  return (
    <>
      <ShiftCard
        shift={mappedShift}
        isApplied={!!applicationId}
        applicationId={applicationId}
        applicationStatus={mappedShift.applicationStatus ?? null}
        onOpenDetails={handleOpenDetails}
        onApply={() => {}}
        onCancel={appId => cancel(appId ?? applicationId)}
        isLoading={isCancelling}
      />

      <ShiftDetailsScreen
        shift={mappedShift}
        vacancyData={shift}
        applicationId={applicationId}
        isOpen={isOpen}
        onClose={handleCloseDetails}
        onApply={handleApplyFromDetails}
        isApplied={!!applicationId}
        onCancel={appId => handleCancelFromDetails(appId)}
        isLoading={isCancelling}
      />
    </>
  )
}

AppliedShiftCard.displayName = 'AppliedShiftCard'
