import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'

import { useToast } from '@/shared/lib/hooks/useToast'
import { useSuccessOverlay } from '@/shared/lib/hooks/useSuccessOverlay'
import { useAppDispatch } from '@/store/hooks'

import { useFeedFiltersState } from '../hooks/useFeedFiltersState'
import { useVacanciesInfiniteList } from '../hooks/useVacanciesInfiniteList'
import { buildVacanciesBaseParams } from '../utils/queryParams'
import { useHotOffers } from '../hooks/useHotOffers'
import { useShiftActions } from '../hooks/useShiftActions'
import { useFeedApplyFlow } from '../hooks/useFeedApplyFlow'
import { useFeedDetailsController } from '../hooks/useFeedDetailsController'
import { useFeedFiltersController } from '../hooks/useFeedFiltersController'
import { useDeleteShift } from '@/shared/lib/hooks/useDeleteShift'

import { vacancyToShift } from '@/shared/shifts/mapping'

import type { FeedType } from '@/shared/shifts/types'
import type { Shift } from '@/shared/shifts/types'
import type { TabOption } from '@/components/ui/tabs'

export const useFeedPageModel = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { toast, showToast, hideToast } = useToast()
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

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteShift(String(id))
        hideToast()
        showSuccess({
          title: t('shift.deleted'),
          description: t('shift.deletedDescription', {
            defaultValue: 'Смена удалена и больше не показывается соискателям.',
          }),
          icon: Trash2,
        })
      } catch {
        hideToast()
        showToast(t('shift.deleteError'), 'error')
      }
    },
    [deleteShift, t, showToast, hideToast, showSuccess]
  )

  const shiftsBaseQuery = useMemo(
    () =>
      buildVacanciesBaseParams({
        advanced: shiftsAdvancedFilters,
        shiftType: 'replacement',
      }),
    [shiftsAdvancedFilters]
  )

  const jobsBaseQuery = useMemo(
    () =>
      buildVacanciesBaseParams({
        advanced: jobsAdvancedFilters,
        shiftType: 'vacancy',
      }),
    [jobsAdvancedFilters]
  )

  const shiftsList = useVacanciesInfiniteList({
    shiftType: 'replacement',
    baseQuery: shiftsBaseQuery,
    enabled: feedType === 'shifts',
    perPage: 5,
  })

  const jobsList = useVacanciesInfiniteList({
    shiftType: 'vacancy',
    baseQuery: jobsBaseQuery,
    enabled: feedType === 'jobs',
    perPage: 5,
  })

  const activeList = feedType === 'shifts' ? shiftsList : jobsList

  const { hotVacancies, refresh: refreshHotOffers } = useHotOffers({
    feedType,
    advancedFilters: feedType === 'shifts' ? shiftsAdvancedFilters : jobsAdvancedFilters,
  })

  const hotVacanciesById = useMemo(() => {
    const m = new Map<number, (typeof hotVacancies)[number]>()
    for (const v of hotVacancies) m.set(v.id, v)
    return m
  }, [hotVacancies])

  const filteredShifts = activeList.items

  const shiftsById = useMemo(() => {
    const m = new Map<number, Shift>()
    for (const s of activeList.items) m.set(s.id, s)
    return m
  }, [activeList.items])
  const emptyMessage = useMemo(
    () =>
      hasActiveFiltersFlag
        ? t('feed.emptyByFilters')
        : feedType === 'shifts'
          ? t('feed.noShifts')
          : t('feed.noVacancies'),
    [hasActiveFiltersFlag, feedType, t]
  )
  const emptyDescription = useMemo(
    () =>
      hasActiveFiltersFlag
        ? t('feed.emptyByFiltersDescription')
        : feedType === 'shifts'
          ? t('feed.noShiftsDescription')
          : t('feed.noVacanciesDescription'),
    [hasActiveFiltersFlag, feedType, t]
  )

  const selectedVacancy = useMemo(() => {
    if (!selectedShiftId) return null
    return (
      activeList.vacanciesMap.get(selectedShiftId) || hotVacanciesById.get(selectedShiftId) || null
    )
  }, [selectedShiftId, activeList.vacanciesMap, hotVacanciesById])

  const selectedShift = useMemo(() => {
    if (!selectedShiftId) return null
    const fromItems = shiftsById.get(selectedShiftId)
    if (fromItems) return fromItems
    if (selectedVacancy) return vacancyToShift(selectedVacancy)
    return null
  }, [selectedShiftId, shiftsById, selectedVacancy])

  const applyCoverShift = useMemo(() => {
    if (!applyCoverTargetShiftId) return null
    const fromItems = shiftsById.get(applyCoverTargetShiftId)
    if (fromItems) return fromItems
    const vacancy = activeList.vacanciesMap.get(applyCoverTargetShiftId)
    if (vacancy) return vacancyToShift(vacancy)
    const hotVacancy = hotVacanciesById.get(applyCoverTargetShiftId)
    return hotVacancy ? vacancyToShift(hotVacancy) : null
  }, [applyCoverTargetShiftId, shiftsById, activeList.vacanciesMap, hotVacanciesById])

  const applicationSuccessShift = useMemo(() => {
    if (!applicationSuccess.shiftId) return null
    const fromItems = shiftsById.get(applicationSuccess.shiftId)
    if (fromItems) return fromItems
    const vacancy = activeList.vacanciesMap.get(applicationSuccess.shiftId)
    if (vacancy) return vacancyToShift(vacancy)
    const hotVacancy = hotVacanciesById.get(applicationSuccess.shiftId)
    return hotVacancy ? vacancyToShift(hotVacancy) : selectedShift
  }, [
    activeList.vacanciesMap,
    applicationSuccess.shiftId,
    hotVacanciesById,
    selectedShift,
    shiftsById,
  ])

  const isApplied = useCallback((id: number) => appliedShiftsSet.has(id), [appliedShiftsSet])
  const getApplicationIdStable = useCallback(
    (id: number) => appliedApplicationsMap[id] ?? getApplicationId(id),
    [appliedApplicationsMap, getApplicationId]
  )
  const getApplicationStatusStable = useCallback(
    (id: number) =>
      activeList.vacanciesMap.get(id)?.my_application?.status ??
      hotVacanciesById.get(id)?.my_application?.status ??
      null,
    [activeList.vacanciesMap, hotVacanciesById]
  )

  const handleRefresh = useCallback(async () => {
    await Promise.all([activeList.refresh(), refreshHotOffers()])
  }, [activeList, refreshHotOffers])

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
    onRefresh: handleRefresh,
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

    toast,
    hideToast,

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
