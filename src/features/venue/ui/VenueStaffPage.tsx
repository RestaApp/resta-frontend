import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAcceptApplicationMutation,
  useGetReceivedShiftApplicationsQuery,
  useGetShiftByIdQuery,
  useRejectApplicationMutation,
} from '@/services/api/shiftsApi'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { ErrorState } from '@/components/ui/states'
import { ShiftDetailsSkeleton } from '@/components/ui/shift-details-skeleton'
import { Toast } from '@/components/ui/toast'
import { useToast } from '@/shared/lib/hooks/useToast'
import { useDeleteShift } from '@/shared/lib/hooks/useDeleteShift'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { UserProfileDrawer } from '@/shared/ui/user-profile/UserProfileDrawer'
import { ShiftDetailsScreen } from '@/shared/ui/shift-details-screen/ShiftDetailsScreen'
import { DetailsScreenFrame } from '@/shared/ui/shift-details-screen/DetailsScreenFrame'
import { mapOwnerVacancyToCardShiftWithPhoto } from '@/shared/shifts/mapping'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import { EmployeeCatalogFiltersDrawer } from './staff/EmployeeCatalogFiltersDrawer'
import { EmployeeCatalogList } from './staff/EmployeeCatalogList'
import { EmployeeInviteDrawer } from './staff/EmployeeInviteDrawer'
import { StaffApplicationsDrawer } from './staff/StaffApplicationsDrawer'
import { StaffPageHeader } from './staff/StaffPageHeader'
import { type StaffItem } from './staff/VenueStaffList'
import { countPendingStaffApplications } from './staff/staffApplicationUtils'
import { useEmployeeCatalogModel } from './staff/useEmployeeCatalogModel'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'

export function VenueStaffPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const catalog = useEmployeeCatalogModel()
  const userData = useAppSelector(selectUserData)
  const ownerPhotoUrl = userData?.photo_url ?? userData?.profile_photo_url ?? null
  const { deleteShift, isLoading: isDeletingShift } = useDeleteShift()
  const {
    data: applicationsData,
    isLoading: isApplicationsLoading,
    refetch: refetchApplications,
  } = useGetReceivedShiftApplicationsQuery()
  const [acceptApplication, { isLoading: isAccepting }] = useAcceptApplicationMutation()
  const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation()
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StaffItem | null>(null)
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

  const staffItems: StaffItem[] = useMemo(() => {
    const list: StaffItem[] = []

    for (const application of applications) {
      const applicationId = application.shift_application_id ?? application.id
      if (!applicationId) continue

      list.push({
        shiftId: application.shift_id ?? 0,
        shiftTitle: application.shift_title ?? '',
        applicationId,
        applicationStatus: application.shift_application_status ?? application.status ?? 'pending',
        person: application,
      })
    }

    return list
  }, [applications])

  const handleAccept = async (applicationId: number, shiftId: number) => {
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
  }

  const handleReject = async (applicationId: number, shiftId: number) => {
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
  }

  const { openUserProfile, openShiftDetail, closeOverlay, overlay } = useDetailOverlay()

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
      openShiftDetail(shiftId)
    },
    [openShiftDetail]
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

  const handleSelectApplicant = (userId: number, applicationId: number | null, shiftId: number) => {
    const item =
      staffItems.find(
        candidate =>
          candidate.shiftId === shiftId &&
          (candidate.applicationId === applicationId ||
            candidate.person.shift_application_id === applicationId ||
            candidate.person.id === applicationId)
      ) ??
      staffItems.find(
        candidate =>
          candidate.shiftId === shiftId &&
          (candidate.person.user_id === userId || candidate.person.user?.id === userId)
      )

    if (!item) return
    setSelectedItem(item)
    openUserProfile(userId)
  }

  const handleCloseDetails = () => {
    setSelectedItem(null)
    setModeratingAction(null)
    closeOverlay()
  }

  const handleDrawerAccept = async () => {
    if (!selectedItem) return
    try {
      setModeratingAction('accept')
      const isSuccess = await handleAccept(selectedItem.applicationId, selectedItem.shiftId)
      if (isSuccess) handleCloseDetails()
    } finally {
      setModeratingAction(null)
    }
  }

  const handleDrawerReject = async () => {
    if (!selectedItem) return
    try {
      setModeratingAction('reject')
      const isSuccess = await handleReject(selectedItem.applicationId, selectedItem.shiftId)
      if (isSuccess) handleCloseDetails()
    } finally {
      setModeratingAction(null)
    }
  }

  const handleRefresh = useCallback(async () => {
    await Promise.all([catalog.refetch(), refetchApplications()])
  }, [catalog, refetchApplications])

  if (catalog.isError) {
    return (
      <>
        <StaffPageHeader
          pendingApplicationsCount={pendingApplicationsCount}
          onOpenFilters={catalog.handleOpenFilters}
          onOpenApplications={() => setIsApplicationsOpen(true)}
        />
        <ErrorState
          title={t('venueUi.staff.catalog.loadError', {
            defaultValue: 'Не удалось загрузить сотрудников',
          })}
          onRetry={() => void catalog.refetch()}
          retryLabel={t('common.retry', { defaultValue: 'Повторить' })}
        />
      </>
    )
  }

  return (
    <>
      <StaffPageHeader
        pendingApplicationsCount={pendingApplicationsCount}
        onOpenFilters={catalog.handleOpenFilters}
        onOpenApplications={() => setIsApplicationsOpen(true)}
      />

      <PullToRefresh
        onRefresh={handleRefresh}
        disabled={
          catalog.isLoading ||
          isApplicationsLoading ||
          isAccepting ||
          isRejecting ||
          moderatingAction != null
        }
      >
        <EmployeeCatalogList
          activeFilters={catalog.activeFilters}
          onResetFilters={catalog.handleResetFilters}
          onRemoveFilter={catalog.handleRemoveFilter}
          isLoading={catalog.isLoading}
          isFetching={catalog.isFetching}
          employees={catalog.employees}
          hasMore={catalog.hasMore}
          onLoadMore={catalog.handleLoadMore}
          getEmployeePositionLabel={catalog.getEmployeePositionLabel}
          getSpecializationLabel={catalog.getSpecializationLabel}
          onOpenProfile={catalog.handleOpenProfile}
          onInvite={catalog.handleOpenInvite}
        />
      </PullToRefresh>

      <StaffApplicationsDrawer
        open={isApplicationsOpen}
        onOpenChange={setIsApplicationsOpen}
        isLoading={isApplicationsLoading}
        items={staffItems}
        isAccepting={isAccepting}
        acceptingApplicationId={acceptingApplicationId}
        onAccept={handleAccept}
        onSelectApplicant={handleSelectApplicant}
        onOpenShiftDetails={handleOpenShiftDetails}
      />

      <EmployeeCatalogFiltersDrawer
        open={catalog.isFiltersOpen}
        onOpenChange={catalog.setIsFiltersOpen}
        draftFilters={catalog.draftFilters}
        setDraftFilters={catalog.setDraftFilters}
        cities={catalog.cities}
        isCitiesLoading={catalog.isCitiesLoading}
        positions={catalog.positions}
        specializations={catalog.specializations}
        getEmployeePositionLabel={catalog.getEmployeePositionLabel}
        getSpecializationLabel={catalog.getSpecializationLabel}
        onApply={catalog.handleApplyFilters}
        onReset={catalog.handleResetDraftFilters}
      />

      <EmployeeInviteDrawer
        open={catalog.isInviteOpen}
        employee={catalog.inviteEmployee}
        vacancies={catalog.inviteableVacancies}
        invitingShiftId={catalog.invitingShiftId}
        onClose={catalog.handleCloseInvite}
        onInvite={catalog.handleInvite}
        getEmployeePositionLabel={catalog.getEmployeePositionLabel}
        getSpecializationLabel={catalog.getSpecializationLabel}
      />

      {isShiftDetailOpen && (isShiftDetailLoading || !mappedShift) ? (
        <DetailsScreenFrame
          variant="page"
          open
          onOpenChange={open => {
            if (!open) handleCloseShiftDetails()
          }}
          onClose={handleCloseShiftDetails}
        >
          <ShiftDetailsSkeleton />
        </DetailsScreenFrame>
      ) : null}

      {mappedShift && isShiftDetailOpen ? (
        <ShiftDetailsScreen
          shift={mappedShift}
          vacancyData={detailVacancy}
          isOpen={isShiftDetailOpen}
          onClose={handleCloseShiftDetails}
          applicationId={null}
          onApply={async () => {}}
          isApplied={false}
          onCancel={async () => {}}
          isLoading={false}
          ownerActions={{
            onEdit: handleEditShift,
            onDelete: handleDeleteShift,
            isDeleting: isDeletingShift,
          }}
        />
      ) : null}

      <UserProfileDrawer
        userId={catalog.selectedProfileId}
        open={catalog.selectedProfileId !== null}
        onClose={catalog.handleCloseProfile}
      />

      <UserProfileDrawer
        userId={selectedItem?.person.user_id ?? selectedItem?.person.user?.id ?? null}
        open={selectedItem != null}
        onClose={handleCloseDetails}
        applicationId={selectedItem?.applicationId ?? null}
        applicationStatus={
          selectedItem?.applicationStatus === 'accepted'
            ? 'accepted'
            : selectedItem?.applicationStatus === 'rejected'
              ? 'rejected'
              : 'pending'
        }
        canModerate={selectedItem?.applicationStatus !== 'rejected'}
        moderatingAction={moderatingAction}
        onAccept={handleDrawerAccept}
        onReject={handleDrawerReject}
      />

      <Toast
        message={catalog.toast.message}
        type={catalog.toast.type}
        isVisible={catalog.toast.isVisible}
        onClose={catalog.hideToast}
      />
    </>
  )
}
