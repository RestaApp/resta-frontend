import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { PayPeriod, Shift } from '../types'
import {
  formatDateRU,
  formatDuration,
  formatTimeRangeRU,
  parseApiDateTime,
  stripMinskPrefix,
} from '../utils/formatting'
import type { HotOffer } from '../../ui/components/HotOffers'
import i18n from '@/shared/i18n/config'

const toNumber = (v?: string | number | null): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const getLogo = (id: number): string => {
  const logos = ['🍽️', '☕️', '🍕', '🥖', '🥘', '🍔', '🍣', '🍜']
  return logos[Math.abs(id) % logos.length]
}

export const getLogoByPosition = (
  position?: string | null,
  idFallback?: number | null
): string => {
  const p = (position ?? '').toLowerCase()

  const map: Record<string, string[]> = {
    chef: ['👨‍🍳', '👩‍🍳', '🍳', '🔪', '🥘'],
    waiter: ['🍽️', '🧑‍🍽️', '🥂', '🍷', '🧾'],
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
  return item.user?.city ?? item.user?.restaurant_profile?.city ?? undefined
}

export const vacancyToShift = (item: VacancyApiItem): Shift => {
  const start = parseApiDateTime(item.start_time ?? undefined)
  const end = parseApiDateTime(item.end_time ?? undefined)

  const date = start ? formatDateRU(start) : ''
  const duration = formatDuration(item.duration)

  const time =
    start && end ? `${formatTimeRangeRU(start, end)}${duration ? ` (${duration})` : ''}` : ''

  const payPeriod: PayPeriod = item.shift_type === 'vacancy' ? 'month' : 'shift'

  const locationRaw = item.location ?? getCityFromUser(item)
  const location = stripMinskPrefix(locationRaw)
  const cuisineTypes = item.user?.restaurant_profile?.cuisine_types ?? undefined

  return {
    id: item.id,
    logo: getLogoByPosition(item.position, item.id),
    restaurant: item.user?.full_name || item.user?.name || item.title || '—',
    rating: toNumber(item.user?.average_rating as unknown as string | number | undefined),

    position: item.position ?? 'chef',
    specialization: item.specialization ?? null,
    cuisineTypes,

    date,
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
    shiftType: item.shift_type,
  }
}

export const vacancyToHotOffer = (v: VacancyApiItem): HotOffer => {
  const s = vacancyToShift(v)
  return {
    id: s.id,
    emoji: s.logo,
    payment: s.pay,
    currency: s.currency,
    time: s.time || s.date,
    restaurant: s.restaurant,
    position: s.position,
    specialization: s.specialization ?? null,
    city: s.city ?? null,
    shiftType: v.shift_type,
  }
}

export const mapVacancyToCardShift = (v: VacancyApiItem): Shift => {
  const restaurant = v.user?.name || v.user?.full_name || v.title || i18n.t('feedFallback.venue')
  const applicationId = v.my_application?.id ?? null
  const applicationStatus = v.my_application?.status ?? v.status ?? null
  const cuisineTypes = v.user?.restaurant_profile?.cuisine_types ?? undefined

  const pay = v.payment ?? 0

  // Используем parseApiDateTime для корректного парсинга формата API
  const start = parseApiDateTime(v.start_time ?? undefined)
  const end = parseApiDateTime(v.end_time ?? undefined)

  const date = start ? formatDateRU(start) : ''
  const time =
    start && end ? formatTimeRangeRU(start, end) : start ? formatTimeRangeRU(start, start) : ''

  return {
    id: v.id,
    logo: getLogoByPosition(v.position, v.id),
    restaurant,
    rating: 0,

    position: v.position ?? 'chef',
    specialization: v.specialization ?? null,
    cuisineTypes,

    date,
    time,

    pay: toNumber(pay),
    currency: 'BYN',
    payPeriod: v.shift_type === 'vacancy' ? 'month' : 'shift',

    location: v.location ?? v.user?.restaurant_profile?.city ?? undefined,
    urgent: Boolean(v.urgent),

    applicationId,
    ownerId: v.user?.id ?? null,
    canApply: Boolean(v.can_apply),

    applicationStatus,

    city: getCityFromUser(v) ?? null,
    shiftType: v.shift_type,
  }
}
