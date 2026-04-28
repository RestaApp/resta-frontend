import i18n from '@/shared/i18n/config'
import { parseDate } from '@/utils/datetime'

export const formatMoney = (value: number): string => {
  const v = Number.isFinite(value) ? value : 0
  const fixed = v.toFixed(2)
  const [integerPart, fractionPart] = fixed.split('.')
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  if (fractionPart === '00') return groupedInteger
  return `${groupedInteger}.${fractionPart}`
}

export const parseMoneyInput = (value?: string | number | null): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const normalized = value
    .replace(/\s+/g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
  if (!normalized) return null

  const firstDot = normalized.indexOf('.')
  const safeValue =
    firstDot === -1
      ? normalized
      : `${normalized.slice(0, firstDot + 1)}${normalized.slice(firstDot + 1).replace(/\./g, '')}`

  const n = Number(safeValue)
  return Number.isFinite(n) ? n : null
}

/**
 * API: "2026-01-11 08:00:00 +0100"
 * -> ISO: "2026-01-11T08:00:00+01:00"
 */
export const parseApiDateTime = (value?: string | null): Date | null => {
  return value ? parseDate(value) : null
}

export const formatDateRU = (d: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(d)
}

export const formatTimeRangeRU = (start: Date, end: Date): string => {
  const fmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
  return `${fmt.format(start)} – ${fmt.format(end)}`
}

export const formatDuration = (hours?: string | number | null): string | undefined => {
  if (hours === null || hours === undefined) return undefined
  const n = typeof hours === 'string' ? Number(hours) : hours
  if (!Number.isFinite(n) || n <= 0) return undefined
  return `${Math.round(n)} ч.`
}

export const stripMinskPrefix = (location?: string | null): string | undefined => {
  if (!location) return undefined
  return location.replace(/^Минск,\s*/i, '')
}

export const formatHourlyRate = (hourlyRate?: string | number | null): string | null => {
  if (hourlyRate === null || hourlyRate === undefined) return null
  const n = typeof hourlyRate === 'string' ? Number(hourlyRate) : hourlyRate
  if (!Number.isFinite(n) || n <= 0) return null
  return formatMoney(n)
}

export const formatShiftType = (shiftType?: 'vacancy' | 'replacement' | null): string | null => {
  if (!shiftType) return null
  return shiftType === 'replacement' ? i18n.t('common.replacement') : i18n.t('common.vacancy')
}

export const formatApplicationsCount = (count: number): { value: string; label: string } => {
  if (count <= 0) return { value: '0', label: i18n.t('feedFallback.noApplications') }
  const last = count % 10
  const last2 = count % 100
  if (last2 >= 11 && last2 <= 14)
    return { value: String(count), label: i18n.t('feedFallback.applications5') }
  if (last === 1) return { value: String(count), label: i18n.t('feedFallback.application') }
  if (last >= 2 && last <= 4)
    return { value: String(count), label: i18n.t('feedFallback.applications2') }
  return { value: String(count), label: i18n.t('feedFallback.applications5') }
}

export const getVacancyTitle = (title?: string | null, position?: string | null): string => {
  return title || position || i18n.t('feedFallback.vacancy')
}
