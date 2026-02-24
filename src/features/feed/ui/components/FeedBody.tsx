import { Toast } from '@/components/ui/toast'
import { AdvancedFilters } from '@/features/feed/ui/components/AdvancedFilters'
import { FeedList } from '@/features/feed/ui/components/FeedList'
import { FeedListArea } from '@/features/feed/ui/components/FeedEmpty'
import { FeedDetails } from '@/features/feed/ui/components/FeedDetails'
import { ProfileAlertDialog } from '@/features/feed/ui/components/ProfileAlertDialog'
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
      <div className="space-y-4 px-4 py-4">
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
            getApplicationId={vm.getApplicationId}
            getApplicationStatus={vm.getApplicationStatus}
            isApplied={vm.isApplied}
            onOpenDetails={vm.openShiftDetails}
            onApplyWithModal={vm.handleApplyWithModal}
            onCancel={vm.handleCancel}
            isShiftLoading={vm.isShiftLoading}
            onEdit={vm.handleEdit}
            onDelete={vm.handleDelete}
            isDeleting={vm.isDeleting}
          />
        </FeedListArea>
      </div>

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
          onApply={vm.handleApply}
          onCancel={vm.handleCancel}
        />
      ) : null}

      <ProfileAlertDialog
        state={vm.profileAlert}
        onClose={vm.closeProfileAlert}
        onOpenProfileEdit={vm.openProfileEdit}
      />

      <AdvancedFilters
        isOpen={vm.isFiltersOpen}
        onClose={vm.closeFilters}
        onApply={vm.applyAdvancedFilters}
        initialFilters={vm.advancedFilters ?? undefined}
        filteredCount={vm.filteredCount}
        isVacancy={vm.isVacancy}
      />
    </>
  )
}
