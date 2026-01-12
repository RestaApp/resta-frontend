import type { GetVacanciesParams } from '@/services/api/shiftsApi'
import type { AdvancedFiltersData } from '../components/AdvancedFilters'
import type { QuickFilter } from './clientFilters'

export type ShiftType = 'replacement' | 'vacancy'

export interface BaseQueryParams {
  activeQuickFilter?: QuickFilter
  advanced?: AdvancedFiltersData | null
  shiftType?: ShiftType
}

export const buildVacanciesBaseParams = (
  options: BaseQueryParams
): Omit<GetVacanciesParams, 'page' | 'per_page' | 'shift_type'> => {
  const params: Omit<GetVacanciesParams, 'page' | 'per_page' | 'shift_type'> = {}

  if (options.activeQuickFilter === 'urgent') params.urgent = true

  const adv = options.advanced
  if (adv) {
    if (adv.priceRange && Array.isArray(adv.priceRange)) {
      params.min_payment = adv.priceRange[0]
      params.max_payment = adv.priceRange[1]
    }

    if (adv.selectedPosition) params.position = adv.selectedPosition

    if (adv.selectedSpecializations?.length) {
      params.specialization = adv.selectedSpecializations[0]
    }

    // даты — только для смен
    if (options.shiftType !== 'vacancy') {
      if (adv.startDate) params.start_date = adv.startDate
      if (adv.endDate) params.end_date = adv.endDate
    }
  }

  return params
}

export const buildVacanciesQueryParams = (args: {
  shiftType: ShiftType
  page: number
  perPage: number
  urgent?: boolean
  activeQuickFilter?: QuickFilter
  advanced?: AdvancedFiltersData | null
}): GetVacanciesParams => {
  const { shiftType, page, perPage, urgent, activeQuickFilter, advanced } = args

  const params: GetVacanciesParams = {
    ...buildVacanciesBaseParams({ activeQuickFilter, advanced, shiftType }),
    shift_type: shiftType,
    page,
    per_page: perPage,
  }

  if (urgent) params.urgent = true
  return params
}