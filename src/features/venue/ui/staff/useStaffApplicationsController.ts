import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAcceptApplicationMutation,
  useGetReceivedShiftApplicationsQuery,
  useGetShiftByIdQuery,
  useRejectApplicationMutation,
  FULL_LIST_PER_PAGE,
} from '@/services/api/shiftsApi'
import { useToast } from '@/shared/lib/hooks/useToast'
import { useDeleteShift } from '@/shared/lib/hooks/useDeleteShift'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { mapOwnerVacancyToCardShiftWithPhoto } from '@/shared/shifts/mapping'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/store/slices/userSlice'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'
import { normalizeApplicationStatus } from '@/shared/shifts/applicationStatus'
import {
  countPendingStaffApplications,
  findStaffItem,
  mapStaffApplicationsToItems,
} from './staffApplicationUtils'

interface SelectedApplicantState {
  applicationId: number | null
  shiftId: number
  userId: number
}

export const useStaffApplicationsController = () => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const userData = useAppSelector(selectUserData)
  const ownerPhotoUrl = userData?.photo_url ?? userData?.profile_photo_url ?? null
  const { deleteShift, isLoading: isDeletingShift } = useDeleteShift()
  const {
    data: applicationsData,
    isLoading: isApplicationsLoading,
    isError: isApplicationsError,
    refetch: refetchApplications,
  } = useGetReceivedShiftApplicationsQuery({ per_page: FULL_LIST_PER_PAGE })
  const [acceptApplication, { isLoading: isAccepting }] = useAcceptApplicationMutation()
  const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation()
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<SelectedApplicantState | null>(null)
  const [moderatingAction, setModeratingAction] = useState<'accept' | 'reject' | null>(null)
  const [acceptingApplicationId, setAcceptingApplicationId] = useState<number | null>(null)

  const applications = useMemo(
    () =>
      applicationsData?.data && Array.isArray(applicationsData.data) ? applicationsData.data : [],
    [applicationsData]
  )

  const pendingApplicationsCount = useMemo(
    () => countPendingStaffApplications(applications),
    [applications]
  )

  const staffItems = useMemo(() => mapStaffApplicationsToItems(applications), [applications])
  const { openUserProfile, openShiftDetail, closeOverlay, overlay } = useDetailOverlay()

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
    isApplicationsOpen,
    setIsApplicationsOpen,
    isApplicationsLoading,
    isApplicationsError,
    pendingApplicationsCount,
    staffItems,
    isAccepting,
    isRejecting,
    acceptingApplicationId,
    handleAccept,
    refetchApplications,
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
