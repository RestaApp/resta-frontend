import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { AdvancedFilters } from '@/features/feed/ui/components/AdvancedFilters'
import { FeedList } from '@/features/feed/ui/components/FeedList'
import { FeedListArea } from '@/features/feed/ui/components/FeedEmpty'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ApplyCoverLetterModal } from '@/features/feed/ui/components/ApplyCoverLetterModal'
import { ApplicationSuccessOverlay } from '@/features/feed/ui/components/ApplicationSuccessOverlay'
import { SuccessOverlay } from '@/components/ui/success-overlay'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import type { ReactNode } from 'react'
import type { FeedBodyVm } from '@/features/feed/model/FeedBodyVm.types'

// Детали смены открываются по тапу — выносим тяжёлый ShiftDetailsScreen из
// инициального чанка ленты (загрузится при первом открытии).
const FeedDetails = lazy(() =>
  import('@/features/feed/ui/components/FeedDetails').then(m => ({ default: m.FeedDetails }))
)

interface FeedBodyProps {
  vm: FeedBodyVm
  header?: ReactNode
}

export function FeedBody({ vm, header }: FeedBodyProps) {
  const { t } = useTranslation()
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
        staticContent={header}
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

      {vm.selectedShiftId ? (
        <Suspense fallback={null}>
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
        </Suspense>
      ) : null}

      <ApplyCoverLetterModal
        key={vm.applyCoverShift?.id ?? 'closed'}
        open={vm.isApplyCoverModalOpen}
        isSubmitting={vm.isApplyCoverModalSubmitting}
        shift={vm.applyCoverShift}
        onClose={vm.closeApplyCoverModal}
        onSubmit={vm.submitApplyCoverModal}
      />

      <ConfirmDialog
        open={vm.profileAlert.open}
        onOpenChange={open => {
          if (!open) vm.closeProfileAlert()
        }}
        title={t('feed.applicationNotSent')}
        description={vm.profileAlert.message}
        cancelLabel={t('common.close')}
        confirmLabel={t('common.openProfile')}
        onConfirm={vm.openProfileEdit}
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

      <SuccessOverlay state={vm.successState} onClose={vm.closeSuccess} />
    </>
  )
}
