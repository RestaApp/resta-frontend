import { useEffect, useMemo } from 'react'
import { useGetVacanciesQuery, type VacancyApiItem } from '@/services/api/shiftsApi'
import type { FeedType } from '../types'
import type { AdvancedFiltersData } from '../components/AdvancedFilters'
import { buildVacanciesQueryParams } from '../utils/queryParams'
import type { HotOffer } from '../components/HotOffers'
import { vacancyToHotOffer } from '../utils/mapping'

interface UseHotOffersParams {
  feedType: FeedType
  advancedFilters: AdvancedFiltersData | null
  addVacanciesToMap: (vacancies: VacancyApiItem[]) => void
}

interface UseHotOffersReturn {
  hotOffers: HotOffer[]
  hotVacancies: VacancyApiItem[]
  hotOffersTotalCount?: number
}

export const useHotOffers = ({ feedType, advancedFilters, addVacanciesToMap }: UseHotOffersParams): UseHotOffersReturn => {
  const params = useMemo(
    () =>
      buildVacanciesQueryParams({
        shiftType: 'replacement',
        page: 1,
        perPage: 4,
        urgent: true,
        advanced: advancedFilters,
      }),
    [advancedFilters]
  )

  const { data: resp } = useGetVacanciesQuery(params, {
    refetchOnMountOrArgChange: false,
    skip: feedType !== 'shifts',
  })

  useEffect(() => {
    if (feedType !== 'shifts') return
    if (!resp?.data?.length) return
    addVacanciesToMap(resp.data)
  }, [resp, feedType, addVacanciesToMap])

  const hotVacancies = useMemo(() => (resp?.data?.length ? resp.data : []), [resp])

  const hotOffers = useMemo<HotOffer[]>(() => {
    if (!resp?.data?.length) return []
    return resp.data.slice(0, 4).map(vacancyToHotOffer)
  }, [resp])

  const hotOffersTotalCount = useMemo(() => {
    const p = resp?.pagination || resp?.meta
    return p?.total_count ?? undefined
  }, [resp])

  return { hotOffers, hotVacancies, hotOffersTotalCount }
}
