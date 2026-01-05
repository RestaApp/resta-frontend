import { useEffect, useMemo } from 'react'
import { useGetVacanciesQuery, type VacancyApiItem } from '@/services/api/shiftsApi'
import type { FeedType } from '../types'
import type { AdvancedFiltersData } from '../components/AdvancedFilters'
import { buildVacanciesQueryParams } from '../utils/queryParams'
import { mapVacancyToShift } from '../utils/mapping'
import type { HotOffer } from '../components/HotOffers'

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

export const useHotOffers = ({
  feedType,
  advancedFilters,
  addVacanciesToMap,
}: UseHotOffersParams): UseHotOffersReturn => {
  const hotShiftsQueryParams = useMemo(
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

  const { data: hotShiftsResponse } = useGetVacanciesQuery(hotShiftsQueryParams, {
    refetchOnMountOrArgChange: false,
    skip: feedType !== 'shifts',
  })

  useEffect(() => {
    if (hotShiftsResponse?.data && hotShiftsResponse.data.length > 0 && feedType === 'shifts') {
      addVacanciesToMap(hotShiftsResponse.data)
    }
  }, [hotShiftsResponse, feedType, addVacanciesToMap])

  const hotOffers = useMemo<HotOffer[]>(() => {
    if (!hotShiftsResponse?.data || hotShiftsResponse.data.length === 0) {
      return []
    }
    return hotShiftsResponse.data.slice(0, 4).map(vacancy => {
      const shift = mapVacancyToShift(vacancy)
      const payment = typeof shift.pay === 'number' && !isNaN(shift.pay) ? shift.pay : 0
      return {
        id: shift.id,
        emoji: shift.logo,
        payment,
        time: shift.date,
        restaurant: shift.restaurant,
        position: vacancy.position || shift.position || 'Сотрудник',
        specialization: vacancy.specialization || null,
      }
    })
  }, [hotShiftsResponse])

  const hotOffersTotalCount = useMemo(() => {
    const pagination = hotShiftsResponse?.pagination || hotShiftsResponse?.meta
    return pagination?.total_count ?? undefined
  }, [hotShiftsResponse])

  const hotVacancies = useMemo(
    () => (hotShiftsResponse?.data && hotShiftsResponse.data.length > 0 ? hotShiftsResponse.data : []),
    [hotShiftsResponse]
  )

  return {
    hotOffers,
    hotVacancies,
    hotOffersTotalCount,
  }
}
