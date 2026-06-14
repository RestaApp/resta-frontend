import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useVacanciesInfiniteList } from '../hooks/useVacanciesInfiniteList'
import { buildVacanciesBaseParams } from '../utils/queryParams'
import { useHotOffers } from '../hooks/useHotOffers'
import type { FeedType, AdvancedFiltersData } from '@/shared/shifts/types'

interface UseFeedListControllerParams {
  feedType: FeedType
  shiftsAdvancedFilters: AdvancedFiltersData | null
  jobsAdvancedFilters: AdvancedFiltersData | null
  hasActiveFilters: boolean
}

export const useFeedListController = ({
  feedType,
  shiftsAdvancedFilters,
  jobsAdvancedFilters,
  hasActiveFilters,
}: UseFeedListControllerParams) => {
  const { t } = useTranslation()

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

  const filteredShifts = activeList.items

  const emptyMessage = useMemo(
    () =>
      hasActiveFilters
        ? t('feed.emptyByFilters')
        : feedType === 'shifts'
          ? t('feed.noShifts')
          : t('feed.noVacancies'),
    [hasActiveFilters, feedType, t]
  )

  const emptyDescription = useMemo(
    () =>
      hasActiveFilters
        ? t('feed.emptyByFiltersDescription')
        : feedType === 'shifts'
          ? t('feed.noShiftsDescription')
          : t('feed.noVacanciesDescription'),
    [hasActiveFilters, feedType, t]
  )

  const onRefresh = useCallback(async () => {
    await Promise.all([activeList.refresh(), refreshHotOffers()])
  }, [activeList, refreshHotOffers])

  return {
    activeList,
    filteredShifts,
    hotVacancies,
    emptyMessage,
    emptyDescription,
    onRefresh,
  }
}
