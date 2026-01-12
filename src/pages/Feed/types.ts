export type FeedType = 'shifts' | 'jobs'
export type PayPeriod = 'shift' | 'month'

export interface Shift {
  id: number
  logo: string
  restaurant: string
  rating: number

  position: string
  specialization?: string | null

  date: string
  time: string

  pay: number
  currency: string
  payPeriod: PayPeriod

  location?: string
  duration?: string
  urgent?: boolean
  badges?: string[]

  applicationId?: number | null
  ownerId?: number | null

  // бизнес-флаги (из API)
  canApply?: boolean
  applicationsCount?: number
}
