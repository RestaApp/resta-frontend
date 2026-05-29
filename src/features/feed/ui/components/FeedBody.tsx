import { Toast } from '@/components/ui/toast'
import { AdvancedFilters } from '@/features/feed/ui/components/AdvancedFilters'
import { FeedList } from '@/features/feed/ui/components/FeedList'
import { FeedListArea } from '@/features/feed/ui/components/FeedEmpty'
import { FeedDetails } from '@/features/feed/ui/components/FeedDetails'
import { ProfileAlertDialog } from '@/features/feed/ui/components/ProfileAlertDialog'
import { ApplyCoverLetterModal } from '@/features/feed/ui/components/ApplyCoverLetterModal'
import { ApplicationSuccessOverlay } from '@/features/feed/ui/components/ApplicationSuccessOverlay'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import type { FeedBodyVm } from '@/features/feed/model/FeedBodyVm.types'

interface FeedBodyProps {
  vm: FeedBodyVm
}

export function FeedBody({ vm }: FeedBodyProps) {
  const isEmpty = vm.filteredShifts.length === 0
  const showEmptyState =
    isEmpty &&
    (vm.activeList.totalCount === 0 ||
      (!vm.activeList.isFetching && vm.activeList.totalCount !== -1))
  const showLoadingAfterEmpty = isEmpty && vm.activeList.isFetching

  return (
    <>
      <PullToRefresh
        onRefresh={vm.onRefresh}
        disabled={vm.activeList.isInitialLoading || vm.activeList.isFetching}
      >
        <div className="ui-density-page ui-density-py-sm ui-density-stack">
          <FeedListArea
            isInitialLoading={vm.activeList.isInitialLoading}
            error={vm.activeList.error}
            showEmptyState={showEmptyState}
            showLoadingAfterEmpty={showLoadingAfterEmpty}
            feedType={vm.feedType}
            hasActiveFilters={vm.hasActiveFilters}
            emptyMessage={vm.emptyMessage}
            emptyDescription={vm.emptyDescription}
            onResetFilters={vm.resetFilters}
          >
            <FeedList
              shifts={vm.filteredShifts}
              activeList={vm.activeList}
              getApplicationStatus={vm.getApplicationStatus}
              onOpenDetails={vm.openShiftDetails}
            />
          </FeedListArea>
        </div>
      </PullToRefresh>

      <Toast
        message={vm.toast.message}
        type={vm.toast.type}
        isVisible={vm.toast.isVisible}
        onClose={vm.hideToast}
      />

      {vm.selectedShiftId ? (
        <FeedDetails
          selectedShift={vm.selectedShift}
          selectedVacancy={vm.selectedVacancy}
          applicationId={vm.getApplicationId(vm.selectedShiftId) ?? null}
          isApplied={vm.isApplied(vm.selectedShiftId)}
          isLoading={vm.isShiftLoading(vm.selectedShiftId)}
          onClose={vm.closeShiftDetails}
          onApply={vm.handleApplyWithModal}
          onCancel={vm.handleCancel}
          ownerActions={{
            onEdit: vm.handleEdit,
            onDelete: vm.handleDelete,
            isDeleting: vm.isDeleting,
          }}
        />
      ) : null}

      <ApplyCoverLetterModal
        open={vm.isApplyCoverModalOpen}
        isSubmitting={vm.isApplyCoverModalSubmitting}
        shift={vm.applyCoverShift}
        onClose={vm.closeApplyCoverModal}
        onSubmit={vm.submitApplyCoverModal}
      />

      <ProfileAlertDialog
        state={vm.profileAlert}
        onClose={vm.closeProfileAlert}
        onOpenProfileEdit={vm.openProfileEdit}
      />

      <ApplicationSuccessOverlay
        open={vm.applicationSuccess.open}
        shift={vm.applicationSuccessShift}
        onOpenApplications={vm.openApplicationsAfterApply}
        onSearchMore={vm.searchMoreAfterApply}
        onClose={vm.closeApplicationSuccess}
      />

      <AdvancedFilters
        isOpen={vm.isFiltersOpen}
        onClose={vm.closeFilters}
        onApply={vm.applyAdvancedFilters}
        initialFilters={vm.advancedFilters ?? undefined}
        isVacancy={vm.isVacancy}
      />
    </>
  )
}
