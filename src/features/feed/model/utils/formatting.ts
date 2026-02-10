import i18n from '@/shared/i18n/config'

export const formatReviews = (count: number): string => {
    const n = Math.abs(count)
    const last = n % 10
    const last2 = n % 100
    if (last2 >= 11 && last2 <= 14) return i18n.t('feedFallback.reviews5')
    if (last === 1) return i18n.t('feedFallback.review')
    if (last >= 2 && last <= 4) return i18n.t('feedFallback.reviews2')
    return i18n.t('feedFallback.reviews5')
  }
  
export const formatMoney = (value: number): string => {
  const v = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'ru-RU', {
    maximumFractionDigits: 0,
  }).format(v)
}
  
  /**
   * API: "2026-01-11 08:00:00 +0100"
   * -> ISO: "2026-01-11T08:00:00+01:00"
   */
export const parseApiDateTime = (value?: string | null): Date | null => {
  if (!value) return null

  // 1) Если уже ISO — пробуем сразу
  // примеры: 2026-01-11T08:00:00+01:00, 2026-01-11T08:00:00Z
  if (value.includes('T')) {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  // 2) Формат: "YYYY-MM-DD HH:MM:SS +0100" или "+01:00"
  const m = value.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([+-]\d{2}):?(\d{2})$/
  )
  if (!m) return null

  const [, datePart, timePart, oh, om] = m
  const iso = `${datePart}T${timePart}${oh}:${om}`
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
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
    return n.toFixed(2)
  }
  
  export const formatShiftType = (shiftType?: 'vacancy' | 'replacement' | null): string | null => {
    if (!shiftType) return null
    return shiftType === 'replacement' ? i18n.t('common.replacement') : i18n.t('common.vacancy')
  }
  
  export const formatApplicationsCount = (count: number): { value: string; label: string } => {
    if (count <= 0) return { value: '0', label: i18n.t('feedFallback.noApplications') }
    const last = count % 10
    const last2 = count % 100
    if (last2 >= 11 && last2 <= 14) return { value: String(count), label: i18n.t('feedFallback.applications5') }
    if (last === 1) return { value: String(count), label: i18n.t('feedFallback.application') }
    if (last >= 2 && last <= 4) return { value: String(count), label: i18n.t('feedFallback.applications2') }
    return { value: String(count), label: i18n.t('feedFallback.applications5') }
  }
  
  export const getVacancyTitle = (title?: string | null, position?: string | null): string => {
    return title || position || i18n.t('feedFallback.vacancy')
  }
  