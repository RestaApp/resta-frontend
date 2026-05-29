/** Параметры GET /api/v1/shifts — см. SEARCH_FILTERS_SPEC.md § Shifts */
import type { GetVacanciesParams } from '@/services/api/shiftsApi'
import { normalizeCatalogPosition } from '@/utils/roles'
import type { AdvancedFiltersData } from '@/shared/shifts/types'

export type ShiftType = 'replacement' | 'vacancy'

export interface BaseQueryParams {
  advanced?: AdvancedFiltersData | null
  shiftType?: ShiftType
}

export const buildVacanciesBaseParams = (
  options: BaseQueryParams
): Omit<GetVacanciesParams, 'page' | 'per_page' | 'shift_type'> => {
  const params: Omit<GetVacanciesParams, 'page' | 'per_page' | 'shift_type'> = {}

  const adv = options.advanced
  if (adv) {
    if (adv.selectedPosition) params.position = normalizeCatalogPosition(adv.selectedPosition)

    if (adv.selectedSpecializations?.length) {
      params.specialization = adv.selectedSpecializations.join(',')
    }

    if (adv.selectedCity?.trim()) {
      params.city = adv.selectedCity.trim()
    }
  }
  return params
}

export const buildVacanciesQueryParams = (args: {
  shiftType: ShiftType
  page: number
  perPage: number
  urgent?: boolean
  advanced?: AdvancedFiltersData | null
}): GetVacanciesParams => {
  const { shiftType, page, perPage, urgent, advanced } = args

  const params: GetVacanciesParams = {
    ...buildVacanciesBaseParams({ advanced, shiftType }),
    shift_type: shiftType,
    page,
    per_page: perPage,
  }

  if (urgent) params.urgent = true
  return params
}
