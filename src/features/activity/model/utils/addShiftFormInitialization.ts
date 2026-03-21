import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { parseApiDateTime } from '@/features/feed/model/utils/formatting'

export const toInputDate = (date: Date): string => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const toInputTime = (date: Date): string => {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export const getInitialShiftDate = (initialValues: VacancyApiItem | null): string | null => {
  const start = initialValues?.start_time
  if (!start) return null

  const dateTime = parseApiDateTime(start)
  if (!dateTime) return null

  return toInputDate(dateTime)
}

export const getInitialShiftTime = (
  initialValues: VacancyApiItem | null,
  field: 'start_time' | 'end_time'
): string => {
  const value = initialValues?.[field]
  if (!value) return ''

  const dateTime = parseApiDateTime(value)
  if (!dateTime) return ''

  return toInputTime(dateTime)
}

export const getInitialPay = (initialValues: VacancyApiItem | null): string => {
  if (!initialValues) return ''
  if (initialValues.payment) return String(initialValues.payment)
  if (initialValues.hourly_rate) return String(initialValues.hourly_rate)
  return ''
}

export const getInitialSpecializations = (initialValues: VacancyApiItem | null): string[] => {
  const list = initialValues?.specializations
  if (list?.length) return list

  const specValue = initialValues?.specialization || ''
  if (!specValue) return []

  return specValue
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
}
