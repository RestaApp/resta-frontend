import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { PayPeriod, Shift } from './types'
import {
  formatDateRU,
  formatDuration,
  formatTimeRangeRU,
  parseApiDateTime,
  stripMinskPrefixAll,
} from './formatting'
import { toLocationArray } from '@/shared/utils/location'
import { toLocalISODateKey } from '@/shared/utils/datetime'
import i18n from '@/shared/i18n/config'
import { formatUserDisplayName } from '@/shared/utils/userDisplayName'

const toNumber = (v?: string | number | null): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const getLogoByPosition = (position?: string | null): string => {
  const normalized = (position ?? '').trim().toLowerCase()

  const map: Record<string, string> = {
    chef: 'C',
    waiter: 'W',
    bartender: 'B',
    barista: 'B',
    manager: 'M',
    support: 'S',
  }

  if (normalized && map[normalized]) return map[normalized]
  return (normalized[0] ?? 'R').toUpperCase()
}

const getCityFromUser = (item: VacancyApiItem): string | undefined => {
  return item.city ?? item.user?.city ?? item.user?.restaurant_profile?.city ?? undefined
}

const getDistanceKm = (item: VacancyApiItem): number | null => {
  const rawDistance = item.distance_km ?? item.distance
  const distance = toNumber(rawDistance)
  if (distance > 0) return distance

  const meters = toNumber(item.distance_meters)
  if (meters > 0) return meters / 1000

  return null
}

const getUserPhotoUrl = (item: VacancyApiItem): string | null => {
  return item.user?.photo_url ?? item.user?.profile_photo_url ?? null
}

const resolveVacancySpecialization = (item: VacancyApiItem): string | null => {
  const direct = item.specialization?.trim()
  if (direct) return direct
  const fromList = item.specializations?.map(value => value?.trim()).find(Boolean)
  return fromList ?? null
}

/**
 * Оплата за период: для вакансии без конкретного окна времени — «за месяц»;
 * если указаны начало и конец смены — сумма относится к этой смене («за смену»).
 */
const resolvePayPeriodFromVacancy = (item: VacancyApiItem): PayPeriod => {
  if (item.shift_type !== 'vacancy') return 'shift'
  const start = parseApiDateTime(item.start_time ?? undefined)
  const end = parseApiDateTime(item.end_time ?? undefined)
  if (start && end && end.getTime() > start.getTime()) return 'shift'
  return 'month'
}

const getVacancyScheduleFields = (item: VacancyApiItem) => {
  const start = parseApiDateTime(item.start_time ?? undefined)
  const end = parseApiDateTime(item.end_time ?? undefined)

  return {
    date: start ? formatDateRU(start) : '',
    dateKey: start ? toLocalISODateKey(start) : null,
    time:
      start && end ? formatTimeRangeRU(start, end) : start ? formatTimeRangeRU(start, start) : '',
  }
}

const isExpiredOwnerListing = (item: VacancyApiItem): boolean => {
  const status = item.status?.trim().toLowerCase()
  if (status === 'completed' || status === 'cancelled' || status === 'canceled') return false

  const deadline = parseApiDateTime(item.end_time ?? undefined) ?? parseApiDateTime(item.start_time)
  return deadline ? deadline.getTime() < Date.now() : false
}

export const vacancyToShift = (item: VacancyApiItem): Shift => {
  const start = parseApiDateTime(item.start_time ?? undefined)
  const end = parseApiDateTime(item.end_time ?? undefined)

  const date = start ? formatDateRU(start) : ''
  const duration = formatDuration(item.duration)

  const time =
    start && end ? `${formatTimeRangeRU(start, end)}${duration ? ` (${duration})` : ''}` : ''

  const payPeriod: PayPeriod = resolvePayPeriodFromVacancy(item)

  const fromApi = stripMinskPrefixAll(item.location)
  const location =
    fromApi.length > 0
      ? fromApi
      : (() => {
          const city = getCityFromUser(item)
          return city ? [city] : []
        })()
  return {
    id: item.id,
    title: item.title?.trim() || null,
    restaurant: formatUserDisplayName(item.user) || item.title?.trim() || '—',
    rating: toNumber(item.user?.average_rating as unknown as string | number | undefined),

    position: item.position ?? 'chef',
    specialization: resolveVacancySpecialization(item),

    date,
    dateKey: start ? toLocalISODateKey(start) : null,
    time,

    pay: toNumber(item.payment),
    currency: 'BYN',
    payPeriod,

    location,
    duration,
    urgent: Boolean(item.urgent),

    applicationId: item.my_application?.id ?? null,
    ownerId: item.user?.id ?? null,
    photoUrl: getUserPhotoUrl(item),

    canApply: item.can_apply,
    applicationsCount: item.applications_count,

    city: getCityFromUser(item) ?? null,
    distanceKm: getDistanceKm(item),
    shiftType: item.shift_type,
  }
}

/** Карточка «моя смена/вакансия» в activity venue — без названия ресторана, isMine */
export const mapOwnerVacancyToCardShift = (item: VacancyApiItem): Shift => {
  const { date, dateKey, time } = getVacancyScheduleFields(item)

  return {
    id: item.id,
    title: item.title?.trim() || null,
    restaurant: '',
    rating: 0,
    position: item.position ?? 'chef',
    specialization: resolveVacancySpecialization(item),
    date,
    dateKey,
    time,
    pay: toNumber(item.payment ?? item.hourly_rate ?? 0),
    currency: 'BYN',
    payPeriod: resolvePayPeriodFromVacancy(item),
    shiftType: item.shift_type,
    location: item.shift_type === 'vacancy' ? undefined : toLocationArray(item.location),
    urgent: Boolean(item.urgent),
    applicationId: null,
    ownerId: item.user?.id ?? null,
    photoUrl: getUserPhotoUrl(item),
    canApply: false,
    applicationsCount: item.applications_count ?? 0,
    isMine: true,
    statusTag: isExpiredOwnerListing(item) ? 'expired' : undefined,
    city: getCityFromUser(item) ?? null,
  }
}

export const mapVacancyToCardShift = (v: VacancyApiItem): Shift => {
  const { date, dateKey, time } = getVacancyScheduleFields(v)
  const restaurant =
    formatUserDisplayName(v.user) || v.title?.trim() || i18n.t('feedFallback.venue')
  const applicationId = v.my_application?.id ?? null

  return {
    id: v.id,
    title: v.title?.trim() || null,
    restaurant,
    rating: 0,
    position: v.position ?? 'chef',
    specialization: resolveVacancySpecialization(v),
    date,
    dateKey,
    time,
    pay: toNumber(v.payment),
    currency: 'BYN',
    payPeriod: resolvePayPeriodFromVacancy(v),
    location: (() => {
      const arr = toLocationArray(v.location)
      if (arr.length > 0) return arr
      const city = getCityFromUser(v)
      return city ? [city] : undefined
    })(),
    urgent: Boolean(v.urgent),
    applicationId,
    ownerId: v.user?.id ?? null,
    photoUrl: getUserPhotoUrl(v),
    canApply: Boolean(v.can_apply),
    applicationStatus: v.my_application?.status ?? v.status ?? null,
    applicationsCount: v.applications_count ?? 0,
    city: getCityFromUser(v) ?? null,
    distanceKm: getDistanceKm(v),
    shiftType: v.shift_type,
  }
}
