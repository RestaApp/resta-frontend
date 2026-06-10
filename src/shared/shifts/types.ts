import type { DateFilterPreset, SalaryRangeId } from './filterConstants'
import type { OwnerShiftListingStatus } from './ownerShiftDisplay'

export type FeedType = 'shifts' | 'jobs'

/** Состояние расширенных фильтров ленты. */
export interface AdvancedFiltersData {
  selectedCity?: string | null
  selectedPosition?: string | null
  selectedSpecializations?: string[]
  selectedSalaryRange?: SalaryRangeId | null
  /** Только для смен (replacement). */
  selectedDatePreset?: DateFilterPreset | null
  customStartDate?: string | null
  customEndDate?: string | null
}
export type PayPeriod = 'shift' | 'month'

export type ShiftType = 'vacancy' | 'replacement'

export type KnownShiftStatus = 'pending' | 'processing' | 'accepted' | 'rejected'

/** Статус заявки на смену — известные значения + произвольные строки API. */
export type ShiftStatus = KnownShiftStatus | (string & {}) | null | undefined

export interface Shift {
  id: number
  title?: string | null
  restaurant: string
  rating: number
  position: string
  specialization?: string | null
  date: string
  /** YYYY-MM-DD локальная дата старта смены, если есть. */
  dateKey?: string | null
  time: string
  pay: number
  currency: string
  payPeriod: 'shift' | 'month'
  location?: string[]
  duration?: string
  urgent?: boolean
  applicationId?: number | null
  ownerId?: number | null
  photoUrl?: string | null
  canApply?: boolean
  applicationsCount?: number
  isMine?: boolean
  applicationStatus?: string | null
  statusTag?: 'expired'
  /** Город (для отображения в карточке). Из user.city / restaurant_profile */
  city?: string | null
  /** Дистанция от пользователя, если список запрошен с геолокацией. */
  distanceKm?: number | null
  /** Тип: вакансия — без даты/времени на карточке */
  shiftType?: 'vacancy' | 'replacement'
  /** Статус публикации владельца (activity venue / мои смены). */
  listingStatus?: OwnerShiftListingStatus
  viewsCount?: number
  showStaleAlert?: boolean
}
