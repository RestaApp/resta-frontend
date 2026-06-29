import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/ui/states'
import { ShiftDetailsSkeleton } from '@/components/ui/shift-details-skeleton'
import { UserProfileDrawer } from '@/shared/ui/user-profile/UserProfileDrawer'
import { ShiftDetailsScreen } from '@/shared/ui/shift-details-screen/ShiftDetailsScreen'
import { DetailsScreenFrame } from '@/shared/ui/shift-details-screen/DetailsScreenFrame'
import { EmployeeCatalogFiltersDrawer } from './staff/EmployeeCatalogFiltersDrawer'
import { EmployeeCatalogList } from './staff/EmployeeCatalogList'
import { EmployeeInviteDrawer } from './staff/EmployeeInviteDrawer'
import { StaffApplicationsDrawer } from './staff/StaffApplicationsDrawer'
import { StaffPageHeader } from './staff/StaffPageHeader'
import { useEmployeeCatalogModel } from './staff/useEmployeeCatalogModel'
import { useStaffApplicationsController } from './staff/useStaffApplicationsController'
import { STAFF_INVITE_ENABLED } from './staff/employeeCatalogTypes'

export function VenueStaffPage() {
  const { t } = useTranslation()
  const catalog = useEmployeeCatalogModel()
  const staff = useStaffApplicationsController()

  const handleRefresh = useCallback(async () => {
    await Promise.all([catalog.refetch(), staff.refetchApplications()])
  }, [catalog, staff])

  const handleOpenCatalogProfile = useCallback(
    (id: number) => {
      staff.clearSelectedApplicant()
      catalog.handleOpenProfile(id)
    },
    [catalog, staff]
  )

  const handleSelectApplicant = useCallback(
    (userId: number, applicationId: number | null, shiftId: number) => {
      catalog.clearSelectedProfile()
      staff.handleSelectApplicant(userId, applicationId, shiftId)
    },
    [catalog, staff]
  )

  if (catalog.isError) {
    return (
      <>
        <StaffPageHeader
          pendingApplicationsCount={staff.pendingApplicationsCount}
          onOpenFilters={catalog.handleOpenFilters}
          onOpenApplications={() => staff.setIsApplicationsOpen(true)}
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
        pendingApplicationsCount={staff.pendingApplicationsCount}
        onOpenFilters={catalog.handleOpenFilters}
        onOpenApplications={() => staff.setIsApplicationsOpen(true)}
      />

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
        onOpenProfile={handleOpenCatalogProfile}
        onInvite={catalog.handleOpenInvite}
        onRefresh={handleRefresh}
        refreshDisabled={
          catalog.isLoading ||
          staff.isApplicationsLoading ||
          staff.isAccepting ||
          staff.isRejecting ||
          staff.moderatingAction != null
        }
      />

      <StaffApplicationsDrawer
        open={staff.isApplicationsOpen}
        onOpenChange={staff.setIsApplicationsOpen}
        isLoading={staff.isApplicationsLoading}
        isError={staff.isApplicationsError}
        onRetry={() => void staff.refetchApplications()}
        items={staff.staffItems}
        isAccepting={staff.isAccepting}
        acceptingApplicationId={staff.acceptingApplicationId}
        onAccept={staff.handleAccept}
        onSelectApplicant={handleSelectApplicant}
        onOpenShiftDetails={staff.handleOpenShiftDetails}
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

      {STAFF_INVITE_ENABLED ? (
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
      ) : null}

      {staff.isShiftDetailOpen && (staff.isShiftDetailLoading || !staff.mappedShift) ? (
        <DetailsScreenFrame
          variant="page"
          open
          onOpenChange={open => {
            if (!open) staff.handleCloseShiftDetails()
          }}
          onClose={staff.handleCloseShiftDetails}
        >
          <ShiftDetailsSkeleton />
        </DetailsScreenFrame>
      ) : null}

      {staff.mappedShift && staff.isShiftDetailOpen ? (
        <ShiftDetailsScreen
          shift={staff.mappedShift}
          vacancyData={staff.detailVacancy}
          isOpen={staff.isShiftDetailOpen}
          onClose={staff.handleCloseShiftDetails}
          applicationId={null}
          onApply={async () => {}}
          isApplied={false}
          onCancel={async () => {}}
          isLoading={false}
          ownerActions={{
            onEdit: staff.handleEditShift,
            onDelete: staff.handleDeleteShift,
            isDeleting: staff.isDeletingShift,
          }}
        />
      ) : null}

      <UserProfileDrawer
        userId={catalog.selectedProfileId}
        open={catalog.isProfileOpen}
        onClose={catalog.handleCloseProfile}
      />

      <UserProfileDrawer
        userId={staff.selectedApplicantUserId}
        open={staff.isApplicantProfileOpen}
        onClose={staff.handleCloseApplicantDetails}
        applicationId={staff.selectedApplicantApplicationId}
        applicationStatus={staff.selectedApplicantStatus}
        canModerate={staff.canModerateSelectedApplicant}
        moderatingAction={staff.moderatingAction}
        onAccept={staff.handleDrawerAccept}
        onReject={staff.handleDrawerReject}
      />
    </>
  )
}
