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
  applicationId?: number // id моей заявки на эту смену (если подана)
  ownerId?: number // id пользователя, который создал вакансию/смену
}






