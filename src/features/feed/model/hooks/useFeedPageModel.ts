import { useMemo, useCallback, useState, useEffect } from 'react'

import { useUserProfile } from '@/hooks/useUserProfile'
import { useToast } from '@/hooks/useToast'
import { useHaptics } from '@/utils/haptics'
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from '@/utils/localStorage'
import { STORAGE_KEYS } from '@/constants/storage'

import { useFeedFiltersState } from '../hooks/useFeedFiltersState'
import { useVacanciesInfiniteList } from '../hooks/useVacanciesInfiniteList'
import { buildVacanciesBaseParams } from '../utils/queryParams'
import { applyClientQuickFilters } from '../utils/clientFilters'
import { useHotOffers } from '../hooks/useHotOffers'
import { useShiftActions } from '../hooks/useShiftActions'
import { syncFiltersPositionAndSpecializations } from '../utils/filterSync'

import { formatFiltersForDisplay, hasActiveFilters } from '@/utils/filters'
import { vacancyToShift } from '../utils/mapping'

import type { FeedType } from '../types'
import type { Shift } from '../types'
import type { TabOption } from '@/components/ui/tabs'
import type { HotOffer } from '../../ui/components/HotOffers'
import type { AdvancedFiltersData } from '../../ui/components/AdvancedFilters'

const FEED_TYPE_OPTIONS: TabOption<FeedType>[] = [
  { id: 'jobs', label: '💼 Вакансии' },
  { id: 'shifts', label: '🔥 Смены' },
]

type ProfileAlertState = {
  open: boolean
  message: string
  missingFields: string[]
}

export const useFeedPageModel = () => {
  useUserProfile()

  const { toast, hideToast } = useToast()
  const haptics = useHaptics()

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
    if (shouldShowShifts === 'true' && feedType !== 'shifts') {
      setFeedType('shifts')
      removeLocalStorageItem(STORAGE_KEYS.NAVIGATE_TO_FEED_SHIFTS)
    }
  }, [feedType, setFeedType])

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
    async (shiftId: number) => {
      try {
        await handleApply(shiftId)
      } catch (error: unknown) {
        const data =
          error && typeof error === 'object' && 'data' in (error as any) ? (error as any).data : null

        if (data?.message === 'profile_incomplete') {
          const missing: string[] = Array.isArray(data.missing_fields) ? data.missing_fields : []
          setProfileAlert({
            open: true,
            missingFields: missing,
            message: `Профиль неполный: отсутствуют поля — ${
              missing.length ? missing.join(', ') : 'неизвестные поля'
            }. Пожалуйста, заполните профиль в настройках.`,
          })
          return
        }

        setProfileAlert({
          open: true,
          missingFields: [],
          message: 'Не удалось отправить заявку. Попробуйте позже.',
        })
      }
    },
    [handleApply]
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
    addVacanciesToMap: shiftsList.addVacanciesToMap,
  })

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

      const fromHot = hotVacancies.find(v => v.id === item.id)
      if (fromHot) {
        shiftsList.addVacanciesToMap([fromHot])
        openShiftDetails(item.id)
      }
    },
    [haptics, shiftsById, activeList.vacanciesMap, hotVacancies, shiftsList, openShiftDetails]
  )

  const showAllHotShifts = useCallback(() => {
    setQuickFilter('urgent')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setQuickFilter])

  const resetFilters = useCallback(() => resetFeedFilters(), [resetFeedFilters])

  const applyAdvancedFilters = useCallback(
    (filters: AdvancedFiltersData | null) => {
      setAdvancedFilters(filters)
      if (!filters) return

      if (feedType === 'shifts') {
        setJobsAdvancedFilters(syncFiltersPositionAndSpecializations(filters, jobsAdvancedFilters))
      } else {
        setShiftsAdvancedFilters(syncFiltersPositionAndSpecializations(filters, shiftsAdvancedFilters))
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

  const activeFiltersList = useMemo(() => formatFiltersForDisplay(advancedFilters), [advancedFilters])

  const hasActiveAdvancedFilters = useMemo(() => {
    const hasQuick = quickFilter !== 'all'
    const hasAdv = advancedFilters ? hasActiveFilters(advancedFilters) : false
    return hasQuick || hasAdv
  }, [advancedFilters, quickFilter])

  const filteredCount = useMemo(() => (activeList.totalCount < 0 ? 0 : activeList.totalCount), [activeList.totalCount])

  const selectedVacancy = useMemo(() => {
    if (!selectedShiftId) return null
    return activeList.vacanciesMap.get(selectedShiftId) || null
  }, [selectedShiftId, activeList.vacanciesMap])

  const selectedShift = useMemo(() => {
    if (!selectedShiftId) return null
    const fromItems = shiftsById.get(selectedShiftId)
    if (fromItems) return fromItems
    if (selectedVacancy) return vacancyToShift(selectedVacancy)
    return null
  }, [selectedShiftId, shiftsById, selectedVacancy])

  return {
    // header
    feedType,
    setFeedType,
    feedTypeOptions: FEED_TYPE_OPTIONS,
    isFetching: activeList.isFetching,
    hasActiveAdvancedFilters,
    activeFiltersList,
    openFilters: () => setIsFiltersOpen(true),

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
    isApplied: (id: number) => appliedShiftsSet.has(id),
    getApplicationId: (id: number) => appliedApplicationsMap[id] ?? getApplicationId(id),
    getApplicationStatus: (id: number) => activeList.vacanciesMap.get(id)?.my_application?.status ?? null,
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
    closeFilters: () => setIsFiltersOpen(false),
    applyAdvancedFilters,
    filteredCount,
    resetFeedFilters,
    isVacancy: feedType === 'jobs',
  }
}