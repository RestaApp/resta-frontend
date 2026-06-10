import i18n from '@/shared/i18n/config'
import { parseApiDateTime } from '@/shared/shifts/formatting'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { toLocationArray } from '@/shared/utils/location'
import { formatUserDisplayName } from '@/shared/utils/userDisplayName'
import { stripVacancyPrefix } from '@/components/ui/shift-card/shift-card-utils'

const resolveLocale = (): string => (i18n.language.startsWith('ru') ? 'ru-RU' : 'en-GB')

export const formatOwnerShiftScheduleLine = (
  startTime?: string | null,
  endTime?: string | null
): string => {
  const start = parseApiDateTime(startTime)
  const end = parseApiDateTime(endTime)
  if (!start) return ''

  const locale = resolveLocale()
  const datePart = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(start)
  if (!end) return datePart

  const timeFmt = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' })
  return `${datePart} • ${timeFmt.format(start)} – ${timeFmt.format(end)}`
}

export const getOwnerShiftSubtitle = (vacancy: VacancyApiItem): string => {
  const fromProfile = vacancy.user?.restaurant_profile?.name?.trim()
  if (fromProfile) return fromProfile

  const fromLocation = toLocationArray(vacancy.location)[0]
    ?.replace(/^Минск,\s*/i, '')
    .trim()
  if (fromLocation) return fromLocation

  const fromUser = formatUserDisplayName(vacancy.user)
  if (fromUser) return fromUser

  return vacancy.city?.trim() ?? ''
}

export const getOwnerShiftTitle = (
  vacancy: VacancyApiItem,
  positionLabel: string,
  specializationLabel?: string | null
): string => {
  const customTitle = vacancy.title?.trim()
  if (customTitle) return stripVacancyPrefix(customTitle)

  if (specializationLabel) return `${positionLabel} · ${specializationLabel}`
  return positionLabel
}
