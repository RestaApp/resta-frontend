/**
 * Утилиты для работы с историей мест работы сотрудника (`work_history`).
 *
 * Формат дат — `YYYY-MM` (см. ROLES_FRONTEND_SPEC). Пустой `endedAt` / `isCurrent`
 * означает текущее место работы. На бэкенд массив уходит целиком — он заменяет
 * поле полностью, поэтому форма всегда держит весь список.
 */

import i18n from '@/shared/i18n/config'
import type { WorkHistoryEntry } from '@/services/api/authApi'

// Клиентский id записи — стабильный ключ для React-списка (не уходит на бэкенд).
let workHistoryUidCounter = 0
const nextWorkHistoryId = (): string => `wh-${(workHistoryUidCounter += 1)}`

/** Запись истории работы в виде, удобном для формы (плоские строки). */
export interface WorkHistoryFormEntry {
  /** Клиентский ключ для рендера списка; на бэкенд не отправляется. */
  id: string
  company: string
  position: string
  /** `YYYY-MM` */
  startedAt: string
  /** `YYYY-MM`; пусто при `isCurrent` */
  endedAt: string
  /** Текущее место работы (нет даты окончания) */
  isCurrent: boolean
  city: string
  description: string
}

/** Ошибки валидации одной записи (для подсветки полей). */
export interface WorkHistoryEntryErrors {
  company?: boolean
  position?: boolean
  startedAt?: boolean
  endedAt?: boolean
}

export const createEmptyWorkHistoryEntry = (): WorkHistoryFormEntry => ({
  id: nextWorkHistoryId(),
  company: '',
  position: '',
  startedAt: '',
  endedAt: '',
  isCurrent: false,
  city: '',
  description: '',
})

/** Сортирует места работы от более ранней даты начала к более поздней. */
export const sortWorkHistoryByStartDate = <T extends { startedAt: string }>(entries: T[]): T[] =>
  entries
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) => {
      const leftDate = left.entry.startedAt.trim()
      const rightDate = right.entry.startedAt.trim()
      if (!leftDate) return rightDate ? 1 : left.index - right.index
      if (!rightDate) return -1
      return leftDate.localeCompare(rightDate) || left.index - right.index
    })
    .map(({ entry }) => entry)

/** Преобразует ответ API в записи формы. */
export const mapApiWorkHistoryToForm = (
  entries: WorkHistoryEntry[] | undefined | null
): WorkHistoryFormEntry[] => {
  if (!Array.isArray(entries)) return []
  return sortWorkHistoryByStartDate(
    entries.map(entry => ({
      id: nextWorkHistoryId(),
      company: entry.company ?? '',
      position: entry.position ?? '',
      startedAt: entry.started_at ?? '',
      endedAt: entry.ended_at ?? '',
      isCurrent: !entry.ended_at,
      city: entry.city ?? '',
      description: entry.description ?? '',
    }))
  )
}

const parseYearMonth = (value: string): number | null => {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  const month = Number(match[2])
  if (month < 1 || month > 12) return null
  return Number(match[1]) * 12 + month - 1
}

/**
 * Считает полный стаж по непересекающимся месяцам из истории работы.
 * Возвращает null, пока ни у одной записи нет корректной даты начала.
 */
export const calculateExperienceYears = (
  entries: WorkHistoryFormEntry[],
  now: Date = new Date()
): number | null => {
  const currentMonth = now.getFullYear() * 12 + now.getMonth()
  const intervals = entries
    .map(entry => {
      const start = parseYearMonth(entry.startedAt)
      if (start === null) return null
      const parsedEnd = entry.isCurrent ? currentMonth : parseYearMonth(entry.endedAt)
      const end = parsedEnd ?? currentMonth
      if (end < start) return null
      return { start, end }
    })
    .filter((interval): interval is { start: number; end: number } => interval !== null)
    .sort((left, right) => left.start - right.start)

  const firstInterval = intervals[0]
  if (!firstInterval) return null

  let totalMonths = 0
  let rangeStart = firstInterval.start
  let rangeEnd = firstInterval.end

  for (const interval of intervals.slice(1)) {
    if (interval.start <= rangeEnd) {
      rangeEnd = Math.max(rangeEnd, interval.end)
      continue
    }
    totalMonths += rangeEnd - rangeStart
    rangeStart = interval.start
    rangeEnd = interval.end
  }

  totalMonths += rangeEnd - rangeStart
  return Math.min(5, Math.floor(totalMonths / 12))
}

/** Полностью пустая запись (например, только что добавленная и не заполненная). */
export const isWorkHistoryEntryEmpty = (entry: WorkHistoryFormEntry): boolean =>
  !entry.company.trim() &&
  !entry.position.trim() &&
  !entry.startedAt.trim() &&
  !entry.endedAt.trim() &&
  !entry.city.trim() &&
  !entry.description.trim()

/**
 * Нормализует записи формы для отправки на бэкенд:
 * - выбрасывает полностью пустые записи;
 * - тримит строки;
 * - опускает `ended_at` для текущего места работы;
 * - опускает пустые опциональные поля.
 */
export const sanitizeWorkHistory = (entries: WorkHistoryFormEntry[]): WorkHistoryEntry[] =>
  sortWorkHistoryByStartDate(entries)
    .filter(entry => !isWorkHistoryEntryEmpty(entry))
    .map(entry => {
      const result: WorkHistoryEntry = {
        company: entry.company.trim(),
        position: entry.position.trim(),
        started_at: entry.startedAt.trim(),
      }
      const endedAt = entry.endedAt.trim()
      const city = entry.city.trim()
      const description = entry.description.trim()

      if (!entry.isCurrent && endedAt) result.ended_at = endedAt
      if (city) result.city = city
      if (description) result.description = description

      return result
    })

/** Ошибки заполнения записи. Пустую запись считаем валидной (её просто отбросим). */
export const getWorkHistoryEntryErrors = (entry: WorkHistoryFormEntry): WorkHistoryEntryErrors => {
  const errors: WorkHistoryEntryErrors = {}
  if (isWorkHistoryEntryEmpty(entry)) return errors

  if (!entry.company.trim()) errors.company = true
  if (!entry.position.trim()) errors.position = true
  if (!entry.startedAt.trim()) errors.startedAt = true

  const endedAt = entry.endedAt.trim()
  const startedAt = entry.startedAt.trim()
  // Сравнение строк `YYYY-MM` корректно по хронологии.
  if (!entry.isCurrent && endedAt && startedAt && endedAt < startedAt) {
    errors.endedAt = true
  }

  return errors
}

/** Есть ли хотя бы одна заполненная, но невалидная запись. */
export const hasInvalidWorkHistory = (entries: WorkHistoryFormEntry[]): boolean =>
  entries.some(entry => Object.keys(getWorkHistoryEntryErrors(entry)).length > 0)

const monthNamesCache = new Map<string, string[]>()

/** Локализованные названия месяцев (с заглавной буквы), кэшируются по locale. */
export const getMonthNames = (locale: string = i18n.language): string[] => {
  const cached = monthNamesCache.get(locale)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' })
  const names = Array.from({ length: 12 }, (_, index) => {
    const name = formatter.format(new Date(2000, index, 1))
    return name.charAt(0).toUpperCase() + name.slice(1)
  })
  monthNamesCache.set(locale, names)
  return names
}

/** Форматирует `YYYY-MM` в локализованное «Март 2022». */
export const formatYearMonth = (value: string, locale: string = i18n.language): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim())
  if (!match) return value.trim()

  const monthIndex = Number(match[2]) - 1
  if (monthIndex < 0 || monthIndex > 11) return value.trim()

  return `${getMonthNames(locale)[monthIndex]} ${match[1]}`
}

/** Форматирует период работы: «Март 2022 — Январь 2024» или «Март 2022 — по наст. время». */
export const formatWorkPeriod = (
  startedAt: string,
  endedAt: string | null | undefined,
  locale: string = i18n.language
): string => {
  const start = formatYearMonth(startedAt, locale)
  const end = endedAt?.trim()
    ? formatYearMonth(endedAt, locale)
    : i18n.t('profile.workHistory.present')

  if (!start) return end
  return `${start} — ${end}`
}
