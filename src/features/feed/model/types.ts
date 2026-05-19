export type FeedType = 'shifts' | 'jobs'

/** Состояние расширенных фильтров ленты (город, позиция, специализации). */
export interface AdvancedFiltersData {
  selectedCity?: string | null
  selectedPosition?: string | null
  selectedSpecializations?: string[]
}
export type PayPeriod = 'shift' | 'month'

export interface Shift {
  id: number
  logo: string
  /** URL фото исполнителя (при заполненной смене); при наличии показывается вместо logo */
  userPhotoUrl?: string | null
  /** Название смены/вакансии от автора (если задано) */
  title?: string | null
  restaurant: string
  rating: number
  position: string
  specialization?: string | null
  cuisineTypes?: string[]
  date: string
  /** YYYY-MM-DD локальная дата старта смены, если есть. */
  dateKey?: string | null
  time: string
  pay: number
  currency: string
  payPeriod: 'shift' | 'month'
  location?: string
  duration?: string
  urgent?: boolean
  verified?: boolean
  escrow?: boolean
  escrowAmount?: number
  badges?: string[]
  applicationId?: number | null
  ownerId?: number | null
  canApply?: boolean
  applicationsCount?: number
  isMine?: boolean

  // NEW: чтобы ShiftCard не лазил в any
  applicationStatus?: string | null

  /** Город (для отображения в карточке). Из user.city / restaurant_profile */
  city?: string | null
  /** Дистанция от пользователя, если список запрошен с геолокацией. */
  distanceKm?: number | null
  /** Тип: вакансия — без даты/времени на карточке */
  shiftType?: 'vacancy' | 'replacement'
}
