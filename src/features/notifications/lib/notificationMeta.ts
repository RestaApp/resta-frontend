import {
  Ban,
  Bell,
  Briefcase,
  CheckCircle2,
  Megaphone,
  Star,
  UserPlus,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import i18n from '@/shared/i18n/config'
import type { NotificationType } from '@/services/api/notificationsApi'

/** Иконка по типу уведомления (см. NOTIFICATIONS_FRONTEND_SPEC). */
const ICON_BY_TYPE: Record<string, LucideIcon> = {
  shift_applied: UserPlus,
  shift_accepted: CheckCircle2,
  shift_rejected: XCircle,
  shift_created: Briefcase,
  shift_completed: CheckCircle2,
  shift_cancelled: Ban,
  application_cancelled: Ban,
  review_received: Star,
  review_reminder: Star,
  system_message: Megaphone,
}

export const getNotificationIcon = (type: NotificationType | string): LucideIcon =>
  ICON_BY_TYPE[type] ?? Bell

const RELATIVE_UNITS: Array<{ limit: number; div: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { limit: 60, div: 1, unit: 'second' },
  { limit: 3600, div: 60, unit: 'minute' },
  { limit: 86400, div: 3600, unit: 'hour' },
  { limit: 604800, div: 86400, unit: 'day' },
  { limit: 2629800, div: 604800, unit: 'week' },
  { limit: 31557600, div: 2629800, unit: 'month' },
  { limit: Infinity, div: 31557600, unit: 'year' },
]

/** «5 минут назад» / «2 часа назад» — относительное время от ISO-строки. */
export const formatRelativeTime = (iso: string, locale: string = i18n.language): string => {
  const timestamp = Date.parse(iso)
  if (Number.isNaN(timestamp)) return ''

  const diffSeconds = (timestamp - Date.now()) / 1000
  const absSeconds = Math.abs(diffSeconds)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  const match = RELATIVE_UNITS.find(entry => absSeconds < entry.limit) ?? RELATIVE_UNITS.at(-1)!
  return rtf.format(Math.round(diffSeconds / match.div), match.unit)
}
