import { useCallback } from 'react'
import type { TFunction } from 'i18next'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/shared/shifts/types'
import { useCurrentUserId } from '@/shared/shifts/useCurrentUserId'
import type { ShiftStatus } from '@/components/ui/StatusPill'
import { sanitizeLocations } from '@/shared/utils/location'

interface UseShiftDetailsScreenControllerParams {
  shift: Shift | null
  vacancyData?: VacancyApiItem | null
  applicationId?: number | null
  onClose: () => void
  onApply: (id: number, message?: string) => Promise<void>
  onCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
  t: TFunction
}

export const useShiftDetailsScreenController = ({
  shift,
  vacancyData,
  applicationId = null,
  onClose,
  onApply,
  onCancel,
}: UseShiftDetailsScreenControllerParams) => {
  const currentUserId = useCurrentUserId()

  const isOwner = Boolean(
    shift?.isMine || (currentUserId && shift?.ownerId && shift.ownerId === currentUserId)
  )
  const description = vacancyData?.description?.trim() ?? ''
  const requirements = vacancyData?.requirements?.trim() ?? ''
  const locationPoints = sanitizeLocations(shift?.location ?? [])

  const appStatus: ShiftStatus =
    vacancyData?.my_application?.status ?? shift?.applicationStatus ?? null
  const isAccepted = appStatus === 'accepted'
  const isRejected = appStatus === 'rejected'

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleApply = useCallback(async () => {
    if (!shift) return
    try {
      await onApply(shift.id)
    } catch {
      // Ошибка уже обрабатывается выше по стеку.
    }
  }, [shift, onApply])

  const handleCancel = useCallback(async () => {
    if (!shift || isRejected) return
    const appId = applicationId ?? shift.applicationId ?? vacancyData?.my_application?.id ?? null
    try {
      await onCancel(appId, shift.id)
      handleClose()
    } catch {
      // Ошибка уже обрабатывается выше по стеку.
    }
  }, [shift, isRejected, applicationId, vacancyData, onCancel, handleClose])

  return {
    isOwner,
    description,
    requirements,
    locationPoints,
    isAccepted,
    isRejected,
    handleClose,
    handleApply,
    handleCancel,
  }
}
