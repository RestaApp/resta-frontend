export type FeedType = 'shifts' | 'jobs'
export type PayPeriod = 'shift' | 'month'

export interface Shift {
  id: number
  logo: string
  restaurant: string
  rating: number
  position: string
  specialization?: string | null
  cuisineTypes?: string[]
  date: string
  time: string
  pay: number
  currency: string
  payPeriod: 'shift' | 'month'
  location?: string
  duration?: string
  urgent?: boolean
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
  /** Тип: вакансия — без даты/времени на карточке */
  shiftType?: 'vacancy' | 'replacement'
}
