import { useCallback, useState } from 'react'
import type { TFunction } from 'i18next'
import {
  type VacancyApiItem,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
} from '@/services/api/shiftsApi'
import type { Shift } from '@/shared/shifts/types'
import { useCurrentUserId } from '@/shared/shifts/useCurrentUserId'
import { useToast } from '@/hooks/useToast'
import { normalizeApiError } from '@/features/feed/model/utils/apiErrors'
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

const extractModerationMessage = (result: unknown): string | undefined => {
  const r = result as { message?: string; data?: { message?: string } } | null
  return r?.message ?? r?.data?.message
}

export const useShiftDetailsScreenController = ({
  shift,
  vacancyData,
  applicationId = null,
  onClose,
  onApply,
  onCancel,
  t,
}: UseShiftDetailsScreenControllerParams) => {
  const currentUserId = useCurrentUserId()
  const { showToast } = useToast()
  const [acceptApplication] = useAcceptApplicationMutation()
  const [rejectApplication] = useRejectApplicationMutation()

  const [activeTab, setActiveTab] = useState<'applicants' | 'details'>('applicants')
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(null)
  const [selectedApplicantApplicationId, setSelectedApplicantApplicationId] = useState<
    number | null
  >(null)
  const [moderating, setModerating] = useState<{ id: number; action: 'accept' | 'reject' } | null>(
    null
  )

  const isOwner = Boolean(
    shift?.isMine || (currentUserId && shift?.ownerId && shift.ownerId === currentUserId)
  )
  const description = vacancyData?.description?.trim() ?? ''
  const requirements = vacancyData?.requirements?.trim() ?? ''
  const locationPoints = sanitizeLocations(shift?.location ?? [])

  const applicants = vacancyData?.applications_preview ?? []
  const showTabs = isOwner && applicants.length > 0
  const applicationsCount = vacancyData?.applications_count

  const selectedApp = applicants.find(
    a => (a.shift_application_id ?? a.id) === selectedApplicantApplicationId
  )
  const selectedAppStatus =
    selectedApp?.shift_application_status ?? selectedApp?.status ?? 'pending'
  const canModerateSelected =
    isOwner &&
    typeof selectedApplicantApplicationId === 'number' &&
    (selectedAppStatus === 'pending' || selectedAppStatus === 'accepted')

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

  const handleAcceptApplication = useCallback(
    async (id: number) => {
      try {
        setModerating({ id, action: 'accept' })
        const result = await acceptApplication({
          applicationId: id,
          shiftId: shift?.id,
        }).unwrap()
        showToast(extractModerationMessage(result) ?? t('shift.applicationAccepted'), 'success')
      } catch (e) {
        const err = normalizeApiError(e, t('shift.acceptApplicationError'), t)
        showToast(err.message, 'error')
        throw err
      } finally {
        setModerating(null)
      }
    },
    [acceptApplication, shift?.id, showToast, t]
  )

  const handleRejectApplication = useCallback(
    async (id: number) => {
      try {
        setModerating({ id, action: 'reject' })
        const result = await rejectApplication({
          applicationId: id,
          shiftId: shift?.id,
        }).unwrap()
        showToast(extractModerationMessage(result) ?? t('shift.applicationRejected'), 'warning')
      } catch (e) {
        const err = normalizeApiError(e, t('shift.rejectApplicationError'), t)
        showToast(err.message, 'error')
        throw err
      } finally {
        setModerating(null)
      }
    },
    [rejectApplication, shift?.id, showToast, t]
  )

  return {
    isOwner,
    description,
    requirements,
    locationPoints,
    applicants,
    showTabs,
    applicationsCount,
    selectedAppStatus,
    canModerateSelected,
    isAccepted,
    isRejected,
    activeTab,
    setActiveTab,
    selectedApplicantId,
    setSelectedApplicantId,
    selectedApplicantApplicationId,
    setSelectedApplicantApplicationId,
    moderating,
    handleClose,
    handleApply,
    handleCancel,
    handleAcceptApplication,
    handleRejectApplication,
  }
}
