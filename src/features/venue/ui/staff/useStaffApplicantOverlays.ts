import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetShiftByIdQuery } from '@/services/api/shiftsApi'
import { useToast } from '@/shared/lib/hooks/useToast'
import { useDeleteShift } from '@/shared/lib/hooks/useDeleteShift'
import { mapOwnerVacancyToCardShiftWithPhoto } from '@/shared/shifts/mapping'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'
import { normalizeApplicationStatus } from '@/shared/shifts/applicationStatus'
import { findStaffItem } from './staffApplicationUtils'
import type { StaffItem } from './VenueStaffList'

interface SelectedApplicantState {
  applicationId: number | null
  shiftId: number
  userId: number
}

interface UseStaffApplicantOverlaysParams {
  staffItems: StaffItem[]
  ownerPhotoUrl: string | null
  handleAccept: (applicationId: number, shiftId: number) => Promise<boolean>
  handleReject: (applicationId: number, shiftId: number) => Promise<boolean>
  refetchApplications: () => void
}

/**
 * UI-state слой: оверлеи профиля соискателя и деталей смены (выбор, модерация
 * из дровера, открытие/редактирование/удаление смены).
 */
export const useStaffApplicantOverlays = ({
  staffItems,
  ownerPhotoUrl,
  handleAccept,
  handleReject,
  refetchApplications,
}: UseStaffApplicantOverlaysParams) => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { deleteShift, isLoading: isDeletingShift } = useDeleteShift()
  const { openUserProfile, openShiftDetail, closeOverlay, overlay } = useDetailOverlay()

  const [selectedApplicant, setSelectedApplicant] = useState<SelectedApplicantState | null>(null)
  const [moderatingAction, setModeratingAction] = useState<'accept' | 'reject' | null>(null)

  const selectedItem = useMemo(() => {
    if (!selectedApplicant) return null
    if (overlay?.type !== 'user' || overlay.id !== selectedApplicant.userId) return null
    return findStaffItem(staffItems, selectedApplicant)
  }, [overlay, selectedApplicant, staffItems])

  const selectedApplicantUserId =
    selectedItem?.person.user_id ?? selectedItem?.person.user?.id ?? null
  const selectedApplicantApplicationId = selectedItem?.applicationId ?? null
  const isApplicantProfileOpen = selectedItem != null
  const selectedApplicantStatus = normalizeApplicationStatus(selectedItem?.applicationStatus)

  const clearSelectedApplicant = useCallback(() => {
    setSelectedApplicant(null)
    setModeratingAction(null)
  }, [])

  const handleSelectApplicant = useCallback(
    (userId: number, applicationId: number | null, shiftId: number) => {
      const item = findStaffItem(staffItems, { userId, applicationId, shiftId })
      if (!item) return

      setSelectedApplicant({ userId, applicationId, shiftId })
      openUserProfile(userId)
    },
    [openUserProfile, staffItems]
  )

  const handleCloseApplicantDetails = useCallback(() => {
    clearSelectedApplicant()
    closeOverlay()
  }, [clearSelectedApplicant, closeOverlay])

  const handleDrawerAccept = useCallback(async () => {
    if (!selectedItem) return

    try {
      setModeratingAction('accept')
      const isSuccess = await handleAccept(selectedItem.applicationId, selectedItem.shiftId)
      if (isSuccess) handleCloseApplicantDetails()
    } finally {
      setModeratingAction(null)
    }
  }, [handleAccept, handleCloseApplicantDetails, selectedItem])

  const handleDrawerReject = useCallback(async () => {
    if (!selectedItem) return

    try {
      setModeratingAction('reject')
      const isSuccess = await handleReject(selectedItem.applicationId, selectedItem.shiftId)
      if (isSuccess) handleCloseApplicantDetails()
    } finally {
      setModeratingAction(null)
    }
  }, [handleCloseApplicantDetails, handleReject, selectedItem])

  const openShiftId = useMemo(() => {
    if (overlay == null) return null
    if (overlay.type !== 'shift' && overlay.type !== 'vacancy') return null
    if (!staffItems.some(item => item.shiftId === overlay.id && item.shiftId > 0)) return null
    return overlay.id
  }, [overlay, staffItems])

  const isShiftDetailOpen = openShiftId != null

  const { data: detailVacancy, isLoading: isShiftDetailLoading } = useGetShiftByIdQuery(
    String(openShiftId),
    {
      skip: !isShiftDetailOpen,
    }
  )

  const mappedShift = useMemo(() => {
    if (!detailVacancy) return null
    return mapOwnerVacancyToCardShiftWithPhoto(detailVacancy, ownerPhotoUrl)
  }, [detailVacancy, ownerPhotoUrl])

  const handleOpenShiftDetails = useCallback(
    (shiftId: number) => {
      if (shiftId <= 0) return
      clearSelectedApplicant()
      openShiftDetail(shiftId)
    },
    [clearSelectedApplicant, openShiftDetail]
  )

  const handleCloseShiftDetails = useCallback(() => {
    closeOverlay()
  }, [closeOverlay])

  const handleEditShift = useCallback(
    (id: number) => {
      if (detailVacancy?.id === id) {
        emitAppEvent(APP_EVENTS.OPEN_ACTIVITY_EDIT_SHIFT, { shift: detailVacancy })
      }
    },
    [detailVacancy]
  )

  const handleDeleteShift = useCallback(
    async (id: number) => {
      try {
        await deleteShift(String(id))
        showToast(t('shift.deleted'), 'success')
        closeOverlay()
        void refetchApplications()
      } catch {
        showToast(t('shift.deleteError'), 'error')
      }
    },
    [closeOverlay, deleteShift, refetchApplications, showToast, t]
  )

  return {
    clearSelectedApplicant,
    handleSelectApplicant,
    selectedApplicantUserId,
    selectedApplicantApplicationId,
    isApplicantProfileOpen,
    selectedApplicantStatus,
    canModerateSelectedApplicant: selectedItem?.applicationStatus !== 'rejected',
    moderatingAction,
    handleCloseApplicantDetails,
    handleDrawerAccept,
    handleDrawerReject,
    isShiftDetailOpen,
    isShiftDetailLoading,
    detailVacancy,
    mappedShift,
    handleOpenShiftDetails,
    handleCloseShiftDetails,
    handleEditShift,
    handleDeleteShift,
    isDeletingShift,
  }
}
