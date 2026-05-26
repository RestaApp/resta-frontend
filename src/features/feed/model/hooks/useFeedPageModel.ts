import { useMemo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useUserProfile } from '@/hooks/useUserProfile'
import { useToast } from '@/hooks/useToast'
import { useAppDispatch } from '@/store/hooks'
import { setLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'

import { useFeedFiltersState } from '../hooks/useFeedFiltersState'
import { useVacanciesInfiniteList } from '../hooks/useVacanciesInfiniteList'
import { buildVacanciesBaseParams } from '../utils/queryParams'
import { useHotOffers } from '../hooks/useHotOffers'
import { useShiftActions } from '../hooks/useShiftActions'
import { useFeedApplyFlow } from '../hooks/useFeedApplyFlow'
import { useDeleteShift } from '@/features/activity/model/hooks/useShifts'
import { syncFiltersPositionAndSpecializations } from '../utils/filterSync'
import { navigateToTab } from '@/features/navigation/model/navigationSlice'

import {
  formatFiltersForDisplay,
  hasActiveFilters,
  normalizeAdvancedFilters,
} from '@/utils/filters'
import { vacancyToShift } from '../utils/mapping'

import { Briefcase, Flame } from 'lucide-react'
import type { FeedType } from '../types'
import type { Shift } from '../types'
import type { TabOption } from '@/components/ui/tabs'
import type { AdvancedFiltersData } from '../types'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'

export const useFeedPageModel = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { userProfile } = useUserProfile()

  const { toast, showToast, hideToast } = useToast()

  const feedTypeOptions = useMemo<TabOption<FeedType>[]>(
    () => [
      { id: 'jobs', label: t('tabs.feed.jobs'), icon: Briefcase },
      { id: 'shifts', label: t('tabs.feed.shifts'), icon: Flame },
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
    resetFilters: resetFeedFilters,
  } = useFeedFiltersState()
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null)

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

  const handleEdit = useCallback(
    (id: number) => {
      setLocalStorageItem(STORAGE_KEYS.EDIT_SHIFT_ID, String(id))
      dispatch(navigateToTab('activity'))
    },
    [dispatch]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteShift(String(id))
        hideToast()
        showToast(t('shift.deleted'), 'success')
      } catch {
        hideToast()
        showToast(t('shift.deleteError'), 'error')
      }
    },
    [deleteShift, t, showToast, hideToast]
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

  const openShiftDetails = useCallback((id: number) => setSelectedShiftId(id), [setSelectedShiftId])
  const closeShiftDetails = useCallback(() => setSelectedShiftId(null), [setSelectedShiftId])
  const openRestaurantDetails = useCallback(
    (restaurantId: number) => {
      setSelectedShiftId(null)
      setSelectedRestaurantId(restaurantId)
    },
    [setSelectedShiftId]
  )
  const closeRestaurantDetails = useCallback(() => setSelectedRestaurantId(null), [])

  const closeApplicationSuccessView = useCallback(() => {
    closeApplicationSuccess()
  }, [closeApplicationSuccess])

  const handleOpenApplications = useCallback(() => {
    closeApplicationSuccess()
    setSelectedShiftId(null)
    setSelectedRestaurantId(null)
    setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_ACTIVITY_MY_APPLICATIONS, 'true')
    dispatch(navigateToTab('activity'))
  }, [closeApplicationSuccess, dispatch, setSelectedShiftId])

  const handleSearchMoreAfterApply = useCallback(() => {
    closeApplicationSuccess()
    setSelectedShiftId(null)
    setSelectedRestaurantId(null)
  }, [closeApplicationSuccess, setSelectedShiftId])

  const resetFilters = useCallback(() => resetFeedFilters(), [resetFeedFilters])

  const openFilters = useCallback(() => setIsFiltersOpen(true), [setIsFiltersOpen])
  const closeFilters = useCallback(() => setIsFiltersOpen(false), [setIsFiltersOpen])

  useEffect(() => {
    return onAppEvent(APP_EVENTS.OPEN_FEED_FILTERS, () => openFilters())
  }, [openFilters])

  const applyAdvancedFilters = useCallback(
    (filters: AdvancedFiltersData | null) => {
      const normalized = normalizeAdvancedFilters(filters)
      setAdvancedFilters(normalized)
      if (!normalized) return

      if (feedType === 'shifts') {
        setJobsAdvancedFilters(
          syncFiltersPositionAndSpecializations(normalized, jobsAdvancedFilters)
        )
      } else {
        setShiftsAdvancedFilters(
          syncFiltersPositionAndSpecializations(normalized, shiftsAdvancedFilters)
        )
      }
    },
    [
      setAdvancedFilters,
      feedType,
      jobsAdvancedFilters,
      shiftsAdvancedFilters,
      setJobsAdvancedFilters,
      setShiftsAdvancedFilters,
    ]
  )

  const hasActiveFiltersFlag = useMemo(() => hasActiveFilters(advancedFilters), [advancedFilters])

  const activeFiltersList = useMemo(
    () => formatFiltersForDisplay(advancedFilters),
    [advancedFilters]
  )
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
    activeFiltersList,
    resetFilters,

    filteredShifts,
    activeList,
    onRefresh: handleRefresh,
    advancedFilters,
    openShiftDetails,
    openRestaurantDetails,

    selectedShiftId,
    selectedRestaurantId,
    selectedShift,
    selectedVacancy,
    closeShiftDetails,
    closeRestaurantDetails,
    handleApplyWithModal,
    isApplyCoverModalOpen,
    isApplyCoverModalSubmitting,
    applyCoverShift,
    userProfile,
    closeApplyCoverModal,
    submitApplyCoverModal,
    applicationSuccess,
    applicationSuccessShift,
    closeApplicationSuccess: closeApplicationSuccessView,
    openApplicationsAfterApply: handleOpenApplications,
    searchMoreAfterApply: handleSearchMoreAfterApply,
    handleCancel,
    isApplied,
    getApplicationId: getApplicationIdStable,
    getApplicationStatus: getApplicationStatusStable,
    isShiftLoading,
    handleEdit,
    handleDelete,
    isDeleting,

    toast,
    hideToast,

    profileAlert,
    closeProfileAlert,
    openProfileEdit,

    isFiltersOpen,
    closeFilters,
    applyAdvancedFilters,
    resetFeedFilters,
    isVacancy: feedType === 'jobs',
  }
}
