import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { PayPeriod, Shift } from '../types'
import {
  formatDateRU,
  formatDuration,
  formatTimeRangeRU,
  parseApiDateTime,
  stripMinskPrefixAll,
} from '../utils/formatting'
import { toLocationArray } from '@/shared/utils/location'
import { toLocalISODateKey } from '@/utils/datetime'
import i18n from '@/shared/i18n/config'

const toNumber = (v?: string | number | null): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const getLogo = (id: number): string => {
  const logos = ['🍽️', '☕️', '🍕', '🥖', '🥘', '🍔', '🍣', '🍜']
  return logos[Math.abs(id) % logos.length]
}

export const getLogoByPosition = (position?: string | null, idFallback?: number | null): string => {
  const p = (position ?? '').toLowerCase()

  const map: Record<string, string[]> = {
    chef: ['👨‍🍳', '👩‍🍳', '🍳', '🔪', '🥘'],
    waiter: ['🍽️', '🥂', '🍷', '🧾', '🍴'],
    bartender: ['🍸', '🍹', '🥃', '🍺', '🧊'],
    barista: ['☕️', '🫖', '🥐', '🍰', '🫘'],
    manager: ['🧑‍💼', '📋', '📊', '📞', '🗓️'],
    support: ['🧽', '🧹', '🧼', '🧤', '🧺'],
  }

  if (p && map[p]?.length) {
    const i = typeof idFallback === 'number' ? Math.abs(idFallback) % map[p].length : 0
    return map[p][i]
  }
  if (typeof idFallback === 'number') return getLogo(idFallback)
  return '🍽️'
}

const getCityFromUser = (item: VacancyApiItem): string | undefined => {
  return item.city ?? item.user?.city ?? item.user?.restaurant_profile?.city ?? undefined
}

const getUserPhotoUrl = (item: VacancyApiItem): string | null => {
  const userWithExtra = item.user as
    | (typeof item.user & { avatar_url?: string | null; image_url?: string | null })
    | undefined
  const profileWithExtra = item.user?.restaurant_profile as
    | (typeof item.user extends undefined
        ? never
        : NonNullable<typeof item.user>['restaurant_profile'] & {
            photo_url?: string | null
            logo_url?: string | null
            image_url?: string | null
          })
    | undefined

  const candidateUrls = [
    item.user?.photo_url,
    item.user?.profile_photo_url,
    (item as VacancyApiItem & { photo_url?: string | null }).photo_url,
    (item as VacancyApiItem & { profile_photo_url?: string | null }).profile_photo_url,
    userWithExtra?.avatar_url,
    userWithExtra?.image_url,
    profileWithExtra?.photo_url,
    profileWithExtra?.logo_url,
    profileWithExtra?.image_url,
  ]

  for (const url of candidateUrls) {
    if (typeof url !== 'string') continue
    const normalized = url.trim()
    if (normalized.length > 0) return normalized
  }
  return null
}

const getDistanceKm = (item: VacancyApiItem): number | null => {
  const rawDistance = item.distance_km ?? item.distance
  const distance = toNumber(rawDistance)
  if (distance > 0) return distance

  const meters = toNumber(item.distance_meters)
  if (meters > 0) return meters / 1000

  return null
}

/**
 * Оплата за период: для вакансии без конкретного окна времени — «за месяц»;
 * если указаны начало и конец смены — сумма относится к этой смене («за смену»).
 */
export const resolvePayPeriodFromVacancy = (item: VacancyApiItem): PayPeriod => {
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
  const cuisineTypes = item.user?.restaurant_profile?.cuisine_types ?? undefined

  return {
    id: item.id,
    logo: getLogoByPosition(item.position, item.id),
    userPhotoUrl: getUserPhotoUrl(item),
    title: item.title?.trim() || null,
    restaurant: item.user?.full_name || item.user?.name || item.title || '—',
    rating: toNumber(item.user?.average_rating as unknown as string | number | undefined),

    position: item.position ?? 'chef',
    specialization: item.specialization ?? null,
    cuisineTypes,

    date,
    dateKey: start ? toLocalISODateKey(start) : null,
    time,

    pay: toNumber(item.payment),
    currency: 'BYN',
    payPeriod,

    location,
    duration,
    urgent: Boolean(item.urgent),
    badges: item.urgent ? ['🔥 Срочно'] : undefined,

    applicationId: item.my_application?.id ?? null,
    ownerId: item.user?.id ?? null,

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
    logo: getLogoByPosition(item.position, item.id),
    userPhotoUrl: getUserPhotoUrl(item),
    title: item.title?.trim() || null,
    restaurant: '',
    rating: 0,
    position: item.position ?? 'chef',
    specialization: item.specialization ?? null,
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
    canApply: false,
    applicationsCount: item.applications_count ?? 0,
    isMine: true,
  }
}

export const mapVacancyToCardShift = (v: VacancyApiItem): Shift => {
  const { date, dateKey, time } = getVacancyScheduleFields(v)
  const restaurant = v.user?.name || v.user?.full_name || v.title || i18n.t('feedFallback.venue')
  const applicationId = v.my_application?.id ?? null

  return {
    id: v.id,
    logo: getLogoByPosition(v.position, v.id),
    userPhotoUrl: getUserPhotoUrl(v),
    title: v.title?.trim() || null,
    restaurant,
    rating: 0,
    position: v.position ?? 'chef',
    specialization: v.specialization ?? null,
    cuisineTypes: v.user?.restaurant_profile?.cuisine_types ?? undefined,
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
    canApply: Boolean(v.can_apply),
    applicationStatus: v.my_application?.status ?? v.status ?? null,
    applicationsCount: v.applications_count ?? 0,
    city: getCityFromUser(v) ?? null,
    distanceKm: getDistanceKm(v),
    shiftType: v.shift_type,
  }
}
