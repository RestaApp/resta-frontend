import { useMemo, useCallback } from 'react'
import { useGetVacanciesQuery, type VacancyApiItem } from '@/services/api/shiftsApi'
import type { FeedType } from '../types'
import type { AdvancedFiltersData } from '../types'
import { buildVacanciesQueryParams } from '../utils/queryParams'

interface UseHotOffersParams {
  feedType: FeedType
  advancedFilters: AdvancedFiltersData | null
}

interface UseHotOffersReturn {
  hotVacancies: VacancyApiItem[]
  refresh: () => Promise<void>
}

/** Срочные вакансии для деталей и refresh (UI-секция горящих отключена). */
export const useHotOffers = ({
  feedType,
  advancedFilters,
}: UseHotOffersParams): UseHotOffersReturn => {
  const shiftType = feedType === 'shifts' ? 'replacement' : 'vacancy'

  const params = useMemo(
    () =>
      buildVacanciesQueryParams({
        shiftType,
        page: 1,
        perPage: 4,
        urgent: true,
        advanced: advancedFilters,
      }),
    [shiftType, advancedFilters]
  )

  const { data: resp, refetch } = useGetVacanciesQuery(params, {
    refetchOnMountOrArgChange: false,
  })

  const hotVacancies = useMemo(() => (resp?.data?.length ? resp.data : []), [resp])

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return { hotVacancies, refresh }
}
