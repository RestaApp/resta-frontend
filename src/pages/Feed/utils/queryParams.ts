/**
 * Утилиты для формирования параметров запроса вакансий
 */

import type { GetVacanciesParams } from '@/services/api/shiftsApi'
import type { AdvancedFiltersData } from '../components/AdvancedFilters'
import type { QuickFilter } from './clientFilters'

export type ShiftType = 'replacement' | 'vacancy'

export interface BaseQueryParams {
  activeQuickFilter?: QuickFilter
  advanced?: AdvancedFiltersData | null
  shiftType?: ShiftType // Тип для исключения дат из вакансий
}

/**
 * Формирует базовые параметры запроса без пагинации
 */
export const buildVacanciesBaseParams = (
  options: BaseQueryParams
): Omit<GetVacanciesParams, 'page' | 'per_page' | 'shift_type'> => {
  const params: Omit<GetVacanciesParams, 'page' | 'per_page' | 'shift_type'> = {}

  // Быстрые фильтры
  if (options.activeQuickFilter === 'urgent') {
    params.urgent = true
  }

  // Расширенные фильтры
  if (options.advanced) {
    if (options.advanced.priceRange && Array.isArray(options.advanced.priceRange)) {
      params.min_payment = options.advanced.priceRange[0]
      params.max_payment = options.advanced.priceRange[1]
    }

    // Используем позицию, если выбрана
    if (options.advanced.selectedPosition) {
      params.position = options.advanced.selectedPosition
    }

    // Используем специализацию, если выбрана
    if (options.advanced.selectedSpecializations && options.advanced.selectedSpecializations.length > 0) {
      params.specialization = options.advanced.selectedSpecializations[0]
    }

    // Используем даты, если выбраны (только для смен, не для вакансий)
    if (options.shiftType !== 'vacancy') {
      if (options.advanced.startDate) {
        params.start_date = options.advanced.startDate
      }
      if (options.advanced.endDate) {
        params.end_date = options.advanced.endDate
      }
    }
  }

  return params
}

/**
 * Формирует параметры запроса вакансий с пагинацией
 */
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

  if (urgent) {
    params.urgent = true
  }

  return params
}
