import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'

import { useToast } from '@/shared/lib/hooks/useToast'
import { useSuccessOverlay } from '@/shared/lib/hooks/useSuccessOverlay'
import { useAppDispatch } from '@/store/hooks'

import { useFeedFiltersState } from '../hooks/useFeedFiltersState'
import { useShiftActions } from '../hooks/useShiftActions'
import { useFeedApplyFlow } from '../hooks/useFeedApplyFlow'
import { useFeedDetailsController } from '../hooks/useFeedDetailsController'
import { useFeedFiltersController } from '../hooks/useFeedFiltersController'
import { useFeedListController } from '../hooks/useFeedListController'
import { useFeedSelectionController } from '../hooks/useFeedSelectionController'
import { useDeleteShift } from '@/shared/lib/hooks/useDeleteShift'

import type { FeedType } from '@/shared/shifts/types'
import type { TabOption } from '@/components/ui/tabs'

export const useFeedPageModel = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { showToast } = useToast()
  const { successState, showSuccess, closeSuccess } = useSuccessOverlay()

  const feedTypeOptions = useMemo<TabOption<FeedType>[]>(
    () => [
      { id: 'jobs', label: t('tabs.feed.jobs') },
      { id: 'shifts', label: t('tabs.feed.shifts') },
    ],
    [t]
  )

  const {
    feedType,
    setFeedType,
    advancedFilters,
    setAdvancedFilters,
    shiftsAdvancedFilters,
    jobsAdvancedFilters,
    setShiftsAdvancedFilters,
    setJobsAdvancedFilters,
    selectedShiftId,
    setSelectedShiftId,
    isFiltersOpen,
    setIsFiltersOpen,
    resetFilters,
  } = useFeedFiltersState()

  const {
    appliedShiftsSet,
    appliedApplicationsMap,
    getApplicationId,
    handleApply,
    handleCancel,
    isShiftLoading,
  } = useShiftActions()

  const { deleteShift, isLoading: isDeleting } = useDeleteShift()

  const {
    profileAlert,
    closeProfileAlert,
    openProfileEdit,
    isApplyCoverModalOpen,
    isApplyCoverModalSubmitting,
    applyCoverTargetShiftId,
    applicationSuccess,
    closeApplyCoverModal,
    closeApplicationSuccess,
    handleApplyWithModal,
    submitApplyCoverModal,
  } = useFeedApplyFlow({
    dispatch,
    t,
    handleApply,
  })

  const {
    openShiftDetails,
    closeShiftDetails,
    openApplicationsAfterApply,
    searchMoreAfterApply,
    handleEditShift,
  } = useFeedDetailsController({
    selectedShiftId,
    setSelectedShiftId,
    closeApplicationSuccess,
  })

  const {
    hasActiveFilters: hasActiveFiltersFlag,
    activeFilters,
    closeFilters,
    applyAdvancedFilters,
    removeFilter,
  } = useFeedFiltersController({
    feedType,
    advancedFilters,
    setAdvancedFilters,
    shiftsAdvancedFilters,
    jobsAdvancedFilters,
    setShiftsAdvancedFilters,
    setJobsAdvancedFilters,
    setIsFiltersOpen,
  })

  const { activeList, filteredShifts, hotVacancies, emptyMessage, emptyDescription, onRefresh } =
    useFeedListController({
      feedType,
      shiftsAdvancedFilters,
      jobsAdvancedFilters,
      hasActiveFilters: hasActiveFiltersFlag,
    })

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteShift(String(id))
        showSuccess({
          title: t('shift.deleted'),
          description: t('shift.deletedDescription', {
            defaultValue: 'Смена удалена и больше не показывается соискателям.',
          }),
          icon: Trash2,
        })
      } catch {
        showToast(t('shift.deleteError'), 'error')
      }
    },
    [deleteShift, t, showToast, showSuccess]
  )

  const {
    selectedVacancy,
    selectedShift,
    applyCoverShift,
    applicationSuccessShift,
    isApplied,
    getApplicationId: getApplicationIdStable,
    getApplicationStatus: getApplicationStatusStable,
  } = useFeedSelectionController({
    activeList,
    hotVacancies,
    selectedShiftId,
    applyCoverTargetShiftId,
    applicationSuccessShiftId: applicationSuccess.shiftId,
    appliedShiftsSet,
    appliedApplicationsMap,
    getApplicationId,
  })

  return {
    feedType,
    setFeedType,
    feedTypeOptions,
    hasActiveFilters: hasActiveFiltersFlag,
    emptyMessage,
    emptyDescription,
    activeFilters,
    resetFilters,
    removeFilter,

    filteredShifts,
    activeList,
    onRefresh,
    advancedFilters,
    openShiftDetails,

    selectedShiftId,
    selectedShift,
    selectedVacancy,
    closeShiftDetails,
    handleApplyWithModal,
    isApplyCoverModalOpen,
    isApplyCoverModalSubmitting,
    applyCoverShift,
    closeApplyCoverModal,
    submitApplyCoverModal,
    applicationSuccess,
    applicationSuccessShift,
    closeApplicationSuccess,
    openApplicationsAfterApply,
    searchMoreAfterApply,
    handleCancel,
    isApplied,
    getApplicationId: getApplicationIdStable,
    getApplicationStatus: getApplicationStatusStable,
    isShiftLoading,
    handleEdit: handleEditShift,
    handleDelete,
    isDeleting,

    successState,
    closeSuccess,

    profileAlert,
    closeProfileAlert,
    openProfileEdit,

    isFiltersOpen,
    closeFilters,
    applyAdvancedFilters,
    isVacancy: feedType === 'jobs',
  }
}
