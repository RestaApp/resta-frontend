export type FeedType = 'shifts' | 'jobs'

export interface Shift {
  id: number
  logo: string
  restaurant: string
  rating: number
  position: string
  specialization?: string | null // Специализация сотрудника
  date: string
  time: string
  pay: number
  currency: string
  location?: string
  duration?: string // Длительность смены в часах
  urgent?: boolean // Срочная смена
  badges?: string[] // Дополнительные бейджи
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





