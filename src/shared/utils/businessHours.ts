import type { TFunction } from 'i18next'
import {
  parseBusinessHours,
  parseHoursRecord,
  serializeBusinessHours,
  toHoursRecord,
  type DayLabels,
  type ParsedBusinessHours,
} from './businessHoursSchedule'

type BusinessHoursRecord = Record<string, string> | null | undefined

/**
 * Ключи, под которыми часы работы раньше сохранялись одним текстом. Новые записи
 * так не пишутся, но старые в базе остаются — их нужно уметь читать.
 */
const LEGACY_TEXT_KEYS = ['schedule', 'text', 'display'] as const

/** Читает часы работы из записи API любого вида: по дням недели или старым текстом. */
const readBusinessHours = (record: BusinessHoursRecord): ParsedBusinessHours | null => {
  if (!record || typeof record !== 'object') return null

  const legacyKey = LEGACY_TEXT_KEYS.find(key => record[key]?.trim())
  return legacyKey ? parseBusinessHours(record[legacyKey] ?? '') : parseHoursRecord(record)
}

/** Запись API → текст расписания, с которым работает форма профиля. */
export function businessHoursRecordToFormValue(record: BusinessHoursRecord): string {
  const hours = readBusinessHours(record)
  return hours ? serializeBusinessHours(hours.schedule, hours.notes) : ''
}

/** Текст расписания из формы → запись API по дням недели. */
export function formValueToBusinessHoursRecord(text: string): Record<string, string> | undefined {
  return toHoursRecord(parseBusinessHours(text))
}

/** Короткие названия дней недели на языке приложения. */
export const getDayLabels = (t: TFunction): DayLabels => ({
  mon: t('common.weekdaysShort.mon'),
  tue: t('common.weekdaysShort.tue'),
  wed: t('common.weekdaysShort.wed'),
  thu: t('common.weekdaysShort.thu'),
  fri: t('common.weekdaysShort.fri'),
  sat: t('common.weekdaysShort.sat'),
  sun: t('common.weekdaysShort.sun'),
})

/**
 * Часы работы для показа: дни недели — на языке приложения, одинаковые дни
 * сгруппированы, особые условия графика — после расписания.
 */
export function formatBusinessHours(record: BusinessHoursRecord, dayLabels: DayLabels): string {
  const hours = readBusinessHours(record)
  return hours ? serializeBusinessHours(hours.schedule, hours.notes, dayLabels) : ''
}
