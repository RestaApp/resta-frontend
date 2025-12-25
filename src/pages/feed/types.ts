export type FeedType = 'shifts' | 'jobs'

export interface Shift {
  id: number
  logo: string
  restaurant: string
  rating: number
  position: string
  date: string
  time: string
  pay: number
  currency: string
}

export interface Job {
  id: number
  logo: string
  restaurant: string
  rating: number
  position: string
  schedule: string
  salary: string
  currency: string
}


