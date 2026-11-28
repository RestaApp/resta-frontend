/**
 * Расписание по дням недели.
 *
 * Запись API (`business_hours`): `{ mon: '09:00-22:00', …, notes: '…' }` — время
 * по ключам дней, выходной день отсутствует (или `closed`), `notes` — особые условия.
 *
 * Текст расписания («Пн-Пт 09:00-22:00») — внутреннее представление формы
 * профиля; в API он не уходит.
 */
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type DayKey = (typeof DAY_KEYS)[number]
export type DayLabels = Record<DayKey, string>

export interface DaySchedule {
  day: DayKey
  enabled: boolean
  from: string
  to: string
}

export interface ParsedBusinessHours {
  schedule: DaySchedule[]
  notes: string
}

/** Ключ записи API с особыми условиями графика. */
const NOTES_KEY = 'notes'
/** Предел длины особых условий — тот же, что проверяет бэк (`BusinessHoursValidator`). */
export const BUSINESS_HOURS_NOTES_MAX_LENGTH = 500

const DEFAULT_FROM = '09:00'
const DEFAULT_TO = '18:00'

const dayLabelToKey: Record<string, DayKey> = {
  пн: 'mon',
  monday: 'mon',
  mon: 'mon',
  вт: 'tue',
  tuesday: 'tue',
  tue: 'tue',
  ср: 'wed',
  wednesday: 'wed',
  wed: 'wed',
  чт: 'thu',
  thursday: 'thu',
  thu: 'thu',
  пт: 'fri',
  friday: 'fri',
  fri: 'fri',
  сб: 'sat',
  saturday: 'sat',
  sat: 'sat',
  вс: 'sun',
  sunday: 'sun',
  sun: 'sun',
}

/**
 * Подписи дней в тексте расписания формы. Канонические: именно их читает
 * `parseBusinessHours`; на язык приложения они не влияют — пользователь их не видит.
 */
const CANONICAL_DAY_LABELS: DayLabels = {
  mon: 'Пн',
  tue: 'Вт',
  wed: 'Ср',
  thu: 'Чт',
  fri: 'Пт',
  sat: 'Сб',
  sun: 'Вс',
}

const normalizeTime = (value: string): string | null => {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const hours = Number(m[1])
  const minutes = Number(m[2])
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const toDayIndex = (value: string): number | null => {
  const key = dayLabelToKey[value.trim().toLowerCase()]
  if (!key) return null
  return DAY_KEYS.indexOf(key)
}

const expandDayToken = (token: string): DayKey[] => {
  const normalized = token.trim().toLowerCase()
  if (!normalized) return []

  const rangeMatch = normalized.match(/^([a-zа-я]{2,})\s*[-–—]\s*([a-zа-я]{2,})$/u)
  if (!rangeMatch) {
    const singleIndex = toDayIndex(normalized)
    if (singleIndex === null) return []
    const day = DAY_KEYS[singleIndex]
    return day ? [day] : []
  }

  const startIndex = toDayIndex(rangeMatch[1] ?? '')
  const endIndex = toDayIndex(rangeMatch[2] ?? '')
  if (startIndex === null || endIndex === null) return []

  if (startIndex <= endIndex) {
    return DAY_KEYS.slice(startIndex, endIndex + 1)
  }

  return [...DAY_KEYS.slice(startIndex), ...DAY_KEYS.slice(0, endIndex + 1)]
}

const parseLine = (line: string): { days: DayKey[]; from: string; to: string } | null => {
  const m = line.match(/^(.+?)\s+(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})$/u)
  if (!m) return null

  const from = normalizeTime(m[2] ?? '')
  const to = normalizeTime(m[3] ?? '')
  if (!from || !to) return null

  const tokens = (m[1] ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

  const expandedDays = tokens.flatMap(expandDayToken)
  if (expandedDays.length === 0) return null

  return { days: Array.from(new Set(expandedDays)), from, to }
}

export const parseBusinessHours = (value: string): ParsedBusinessHours => {
  const base: DaySchedule[] = DAY_KEYS.map(day => ({
    day,
    enabled: false,
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  }))

  const notes: string[] = []
  const lines = value.split('\n')

  lines.forEach(line => {
    const parsed = parseLine(line.trim())
    if (!parsed) {
      notes.push(line)
      return
    }
    parsed.days.forEach(day => {
      const index = DAY_KEYS.indexOf(day)
      if (index === -1) return
      base[index] = {
        day,
        enabled: true,
        from: parsed.from,
        to: parsed.to,
      }
    })
  })

  return {
    schedule: base,
    notes: notes.join('\n'),
  }
}

const areSameTime = (a: DaySchedule, b: DaySchedule) => {
  return a.enabled && b.enabled && a.from === b.from && a.to === b.to
}

const toDayLabel = (fromIndex: number, toIndex: number, dayLabels: DayLabels): string => {
  const from = DAY_KEYS[fromIndex]
  const to = DAY_KEYS[toIndex]
  if (!from || !to) return ''
  return from === to ? dayLabels[from] : `${dayLabels[from]}-${dayLabels[to]}`
}

/**
 * Собирает текст расписания: подряд идущие дни с одинаковым временем — одной строкой.
 * `dayLabels` задаются только для показа; для сохранения остаются канонические.
 */
export const serializeBusinessHours = (
  schedule: DaySchedule[],
  notes: string,
  dayLabels: DayLabels = CANONICAL_DAY_LABELS
): string => {
  const lines: string[] = []
  let index = 0
  while (index < schedule.length) {
    const current = schedule[index]
    if (!current || !current.enabled) {
      index += 1
      continue
    }
    let endIndex = index
    while (endIndex + 1 < schedule.length) {
      const next = schedule[endIndex + 1]
      if (!next || !areSameTime(current, next)) break
      endIndex += 1
    }
    lines.push(`${toDayLabel(index, endIndex, dayLabels)} ${current.from}-${current.to}`)
    index = endIndex + 1
  }

  const schedulePart = lines.join('\n')
  if (!notes) return schedulePart
  if (!schedulePart) return notes
  return `${schedulePart}\n${notes}`
}

const TIME_RANGE_PATTERN = /^(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})$/
const CLOSED_PATTERN = /^closed$/i

/**
 * Читает запись API. День без значения или со значением `closed` — выходной.
 * Всё остальное, что не удалось прочитать как интервал времени, и поля вне
 * контракта уходят в примечания как есть: данные показываются, а не теряются молча.
 */
export const parseHoursRecord = (record: Record<string, unknown>): ParsedBusinessHours => {
  const notes: string[] = []
  const schedule = DAY_KEYS.map((day): DaySchedule => {
    const value = typeof record[day] === 'string' ? record[day].trim() : ''
    const match = value.match(TIME_RANGE_PATTERN)
    const from = normalizeTime(match?.[1] ?? '')
    const to = normalizeTime(match?.[2] ?? '')
    if (from && to) return { day, enabled: true, from, to }

    if (value && !CLOSED_PATTERN.test(value)) notes.push(`${CANONICAL_DAY_LABELS[day]}: ${value}`)
    return { day, enabled: false, from: DEFAULT_FROM, to: DEFAULT_TO }
  })

  const dayKeys: readonly string[] = DAY_KEYS
  for (const [key, value] of Object.entries(record)) {
    if (dayKeys.includes(key) || typeof value !== 'string' || !value.trim()) continue
    notes.push(key === NOTES_KEY ? value.trim() : `${key}: ${value.trim()}`)
  }

  return { schedule, notes: notes.join('\n') }
}

/** Собирает запись API; undefined — когда сохранять нечего. */
export const toHoursRecord = ({
  schedule,
  notes,
}: ParsedBusinessHours): Record<string, string> | undefined => {
  const record: Record<string, string> = {}
  for (const { day, enabled, from, to } of schedule) {
    if (enabled) record[day] = `${from}-${to}`
  }
  if (notes.trim()) record[NOTES_KEY] = notes.trim()

  return Object.keys(record).length > 0 ? record : undefined
}
