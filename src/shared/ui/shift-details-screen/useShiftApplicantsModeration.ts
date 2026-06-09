import { useCallback, useState } from 'react'
import type { TFunction } from 'i18next'
import {
  type VacancyApiItem,
  useAcceptApplicationMutation,
  useRejectApplicationMutation,
} from '@/services/api/shiftsApi'
import { useToast } from '@/shared/lib/hooks/useToast'
import { normalizeApiError } from '@/features/feed/model/utils/apiErrors'
import { getApplicationsPreview } from '@/shared/shifts/applicationsPreview'

interface UseShiftApplicantsModerationParams {
  shiftId?: number
  vacancyData?: VacancyApiItem | null
  t: TFunction
}

const extractModerationMessage = (result: unknown): string | undefined => {
  const r = result as { message?: string; data?: { message?: string } } | null
  return r?.message ?? r?.data?.message
}

export const useShiftApplicantsModeration = ({
  shiftId,
  vacancyData,
  t,
}: UseShiftApplicantsModerationParams) => {
  const { showToast } = useToast()
  const [acceptApplication] = useAcceptApplicationMutation()
  const [rejectApplication] = useRejectApplicationMutation()

  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(null)
  const [selectedApplicantApplicationId, setSelectedApplicantApplicationId] = useState<
    number | null
  >(null)
  const [moderating, setModerating] = useState<{ id: number; action: 'accept' | 'reject' } | null>(
    null
  )

  const applicationsPreview = getApplicationsPreview(vacancyData)
  const applicationsCount = vacancyData?.applications_count

  const selectedApp = applicationsPreview.find(
    a => (a.shift_application_id ?? a.id) === selectedApplicantApplicationId
  )
  const selectedAppStatus =
    selectedApp?.shift_application_status ?? selectedApp?.status ?? 'pending'
  const canModerateSelected =
    typeof selectedApplicantApplicationId === 'number' &&
    (selectedAppStatus === 'pending' || selectedAppStatus === 'accepted')

  const handleAcceptApplication = useCallback(
    async (id: number) => {
      try {
        setModerating({ id, action: 'accept' })
        const result = await acceptApplication({
          applicationId: id,
          shiftId,
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
    [acceptApplication, shiftId, showToast, t]
  )

  const handleRejectApplication = useCallback(
    async (id: number) => {
      try {
        setModerating({ id, action: 'reject' })
        const result = await rejectApplication({
          applicationId: id,
          shiftId,
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
    [rejectApplication, shiftId, showToast, t]
  )

  const closeApplicantProfile = useCallback(() => {
    setSelectedApplicantId(null)
    setSelectedApplicantApplicationId(null)
  }, [])

  return {
    applicationsPreview,
    applicationsCount,
    moderating,
    selectedApplicantId,
    selectedApplicantApplicationId,
    selectedAppStatus,
    canModerateSelected,
    setSelectedApplicantId,
    setSelectedApplicantApplicationId,
    handleAcceptApplication,
    handleRejectApplication,
    closeApplicantProfile,
  }
}
