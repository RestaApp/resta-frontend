import type { DayKey } from '@/features/profile/model/utils/businessFields'

export const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Пн',
  tue: 'Вт',
  wed: 'Ср',
  thu: 'Чт',
  fri: 'Пт',
  sat: 'Сб',
  sun: 'Вс',
}

export const WEEKDAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri']
