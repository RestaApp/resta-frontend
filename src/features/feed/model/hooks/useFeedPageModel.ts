import { useMemo, useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useUserProfile } from '@/hooks/useUserProfile'
import { useToast } from '@/hooks/useToast'
import { useHaptics } from '@/utils/haptics'
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'

import { useFeedFiltersState } from '../hooks/useFeedFiltersState'
import { useVacanciesInfiniteList } from '../hooks/useVacanciesInfiniteList'
import { buildVacanciesBaseParams } from '../utils/queryParams'
import { applyClientQuickFilters } from '../utils/clientFilters'
import { useHotOffers } from '../hooks/useHotOffers'
import { useShiftActions } from '../hooks/useShiftActions'
import { syncFiltersPositionAndSpecializations } from '../utils/filterSync'
import { normalizeApiError } from '../utils/apiErrors'

import { formatFiltersForDisplay, hasActiveFilters } from '@/utils/filters'
import { vacancyToShift } from '../utils/mapping'

import { Briefcase, Flame } from 'lucide-react'
import type { FeedType } from '../types'
import type { Shift } from '../types'
import type { TabOption } from '@/components/ui/tabs'
import type { HotOffer } from '../../ui/components/HotOffers'
import type { AdvancedFiltersData } from '../../ui/components/AdvancedFilters'

type ProfileAlertState = {
  open: boolean
  message: string
  missingFields: string[]
}

export const useFeedPageModel = () => {
  const { t } = useTranslation()
  useUserProfile()

  const { toast, hideToast } = useToast()
  const haptics = useHaptics()

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
    quickFilter,
    setQuickFilter,
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
    userPosition,
  } = useFeedFiltersState()

  // Переключение на таб "Смены" из внешнего флага (поведение сохраняем)
  useEffect(() => {
    const shouldShowShifts = getLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS)
    if (shouldShowShifts === 'true') {
      removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS)
    }
  }, [])

  const {
    appliedShiftsSet,
    appliedApplicationsMap,
    getApplicationId,
    handleApply,
    handleCancel,
    isShiftLoading,
  } = useShiftActions()

  const [profileAlert, setProfileAlert] = useState<ProfileAlertState>({
    open: false,
    message: '',
    missingFields: [],
  })

  const closeProfileAlert = useCallback(() => {
    setProfileAlert(prev => ({ ...prev, open: false }))
  }, [])

  const openProfileEdit = useCallback(() => {
    closeProfileAlert()
    setLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_PROFILE_EDIT, 'true')
    window.dispatchEvent(new CustomEvent('navigateToProfileEdit'))
    window.dispatchEvent(new CustomEvent('openProfileEdit'))
  }, [closeProfileAlert])

  const handleApplyWithModal = useCallback(
    async (shiftId: number, message?: string) => {
      try {
        await handleApply(shiftId, message)
      } catch (error: unknown) {
        const normalized = normalizeApiError(error, t('errors.applyError'), t)

        if (normalized.kind === 'profile_incomplete') {
          setProfileAlert({
            open: true,
            missingFields: normalized.missingFieldsLabels,
            message: normalized.message,
          })
          return
        }

        setProfileAlert({
          open: true,
          missingFields: [],
          message: normalized.message,
        })
      }
    },
    [handleApply, t]
  )

  const shiftsBaseQuery = useMemo(
    () =>
      buildVacanciesBaseParams({
        activeQuickFilter: quickFilter,
        advanced: shiftsAdvancedFilters,
        shiftType: 'replacement',
      }),
    [quickFilter, shiftsAdvancedFilters]
  )

  const jobsBaseQuery = useMemo(
    () =>
      buildVacanciesBaseParams({
        activeQuickFilter: quickFilter,
        advanced: jobsAdvancedFilters,
        shiftType: 'vacancy',
      }),
    [quickFilter, jobsAdvancedFilters]
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

  const { hotOffers, hotVacancies, hotOffersTotalCount } = useHotOffers({
    feedType,
    advancedFilters: feedType === 'shifts' ? shiftsAdvancedFilters : jobsAdvancedFilters,
  })

  const hotVacanciesById = useMemo(() => {
    const m = new Map<number, (typeof hotVacancies)[number]>()
    for (const v of hotVacancies) m.set(v.id, v)
    return m
  }, [hotVacancies])

  // Клиентские quick filters — только для отображения списка
  const filteredShifts = useMemo(() => {
    return applyClientQuickFilters({
      shifts: activeList.items,
      quickFilter,
      userPosition,
    })
  }, [activeList.items, quickFilter, userPosition])

  // IMPORTANT: для деталей лучше иметь lookup по исходным items (не по отфильтрованному списку)
  const shiftsById = useMemo(() => {
    const m = new Map<number, Shift>()
    for (const s of activeList.items) m.set(s.id, s)
    return m
  }, [activeList.items])

  const openShiftDetails = useCallback((id: number) => setSelectedShiftId(id), [setSelectedShiftId])
  const closeShiftDetails = useCallback(() => setSelectedShiftId(null), [setSelectedShiftId])

  const handleHotOfferClick = useCallback(
    (item: HotOffer) => {
      haptics.trigger('light')

      if (shiftsById.has(item.id)) {
        openShiftDetails(item.id)
        return
      }

      const fromMap = activeList.vacanciesMap.get(item.id)
      if (fromMap) {
        openShiftDetails(item.id)
        return
      }

      if (hotVacanciesById.has(item.id)) openShiftDetails(item.id)
    },
    [haptics, shiftsById, activeList.vacanciesMap, hotVacanciesById, openShiftDetails]
  )

  const showAllHotShifts = useCallback(() => {
    setQuickFilter('urgent')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setQuickFilter])

  const resetFilters = useCallback(() => resetFeedFilters(), [resetFeedFilters])

  const openFilters = useCallback(() => setIsFiltersOpen(true), [setIsFiltersOpen])
  const closeFilters = useCallback(() => setIsFiltersOpen(false), [setIsFiltersOpen])

  useEffect(() => {
    const handleOpen = () => openFilters()
    window.addEventListener('openFeedFilters', handleOpen)
    return () => window.removeEventListener('openFeedFilters', handleOpen)
  }, [openFilters])

  const applyAdvancedFilters = useCallback(
    (filters: AdvancedFiltersData | null) => {
      setAdvancedFilters(filters)
      if (!filters) return

      if (feedType === 'shifts') {
        setJobsAdvancedFilters(syncFiltersPositionAndSpecializations(filters, jobsAdvancedFilters))
      } else {
        setShiftsAdvancedFilters(
          syncFiltersPositionAndSpecializations(filters, shiftsAdvancedFilters)
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

  const hasActiveQuick = useMemo(() => quickFilter !== 'all', [quickFilter])
  const hasActiveAdvanced = useMemo(
    () => (advancedFilters ? hasActiveFilters(advancedFilters) : false),
    [advancedFilters]
  )
  const hasActiveAny = useMemo(
    () => hasActiveQuick || hasActiveAdvanced,
    [hasActiveQuick, hasActiveAdvanced]
  )

  const activeFiltersList = useMemo(
    () => formatFiltersForDisplay(advancedFilters, quickFilter),
    [advancedFilters, quickFilter]
  )

  const emptyMessage = useMemo(
    () =>
      hasActiveAny
        ? t('feed.emptyByFilters')
        : feedType === 'shifts'
          ? t('feed.noShifts')
          : t('feed.noVacancies'),
    [hasActiveAny, feedType, t]
  )
  const emptyDescription = useMemo(
    () =>
      hasActiveAny
        ? t('feed.emptyByFiltersDescription')
        : feedType === 'shifts'
          ? t('feed.noShiftsDescription')
          : t('feed.noVacanciesDescription'),
    [hasActiveAny, feedType, t]
  )

  const filteredCount = useMemo(() => Math.max(0, activeList.totalCount), [activeList.totalCount])

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

  return {
    // header
    feedType,
    setFeedType,
    feedTypeOptions,
    isFetching: activeList.isFetching,
    isRefreshing: activeList.isRefreshing,
    hasActiveAdvancedFilters: hasActiveAdvanced,
    hasActiveFilters: hasActiveAny,
    emptyMessage,
    emptyDescription,
    activeFiltersList,
    openFilters,

    // hot offers
    hotOffers,
    hotOffersTotalCount,
    showAllHotShifts,
    onHotOfferClick: handleHotOfferClick,

    // list
    filteredShifts,
    activeList,
    quickFilter,
    advancedFilters,
    resetFilters,
    openShiftDetails,

    // details / actions
    selectedShiftId,
    selectedShift,
    selectedVacancy,
    closeShiftDetails,
    handleApply,
    handleApplyWithModal,
    handleCancel,
    isApplied,
    getApplicationId: getApplicationIdStable,
    getApplicationStatus: getApplicationStatusStable,
    isShiftLoading,

    // toast
    toast,
    hideToast,

    // profile alert
    profileAlert,
    closeProfileAlert,
    openProfileEdit,

    // advanced filters modal
    isFiltersOpen,
    closeFilters,
    applyAdvancedFilters,
    filteredCount,
    resetFeedFilters,
    isVacancy: feedType === 'jobs',
  }
}
