const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type DayKey = (typeof DAY_KEYS)[number]

export interface DaySchedule {
  day: DayKey
  enabled: boolean
  from: string
  to: string
}

interface ParsedBusinessHours {
  schedule: DaySchedule[]
  notes: string
}

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

const dayKeyToRuLabel: Record<DayKey, string> = {
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

const splitAddressLines = (value: string): string[] => {
  const lines = value.split('\n').map(line => line.trim())
  if (lines.length === 0) return ['']
  if (lines.every(line => !line)) return ['']
  return lines
}

export const parseAddresses = (value: string): string[] => splitAddressLines(value)

export const serializeAddresses = (addresses: string[]): string => {
  const normalized = addresses.map(line => line.trim())
  return normalized.join('\n')
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
    return singleIndex === null ? [] : [DAY_KEYS[singleIndex]]
  }

  const startIndex = toDayIndex(rangeMatch[1])
  const endIndex = toDayIndex(rangeMatch[2])
  if (startIndex === null || endIndex === null) return []

  if (startIndex <= endIndex) {
    return DAY_KEYS.slice(startIndex, endIndex + 1)
  }

  return [...DAY_KEYS.slice(startIndex), ...DAY_KEYS.slice(0, endIndex + 1)]
}

const parseLine = (line: string): { days: DayKey[]; from: string; to: string } | null => {
  const m = line.match(/^(.+?)\s+(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})$/u)
  if (!m) return null

  const from = normalizeTime(m[2])
  const to = normalizeTime(m[3])
  if (!from || !to) return null

  const tokens = m[1]
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
  const lines = value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  lines.forEach(line => {
    const parsed = parseLine(line)
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

const toDayLabel = (fromIndex: number, toIndex: number): string => {
  if (fromIndex === toIndex) return dayKeyToRuLabel[DAY_KEYS[fromIndex]]
  return `${dayKeyToRuLabel[DAY_KEYS[fromIndex]]}-${dayKeyToRuLabel[DAY_KEYS[toIndex]]}`
}

export const serializeBusinessHours = (schedule: DaySchedule[], notes: string): string => {
  const lines: string[] = []
  let index = 0
  while (index < schedule.length) {
    const current = schedule[index]
    if (!current.enabled) {
      index += 1
      continue
    }
    let endIndex = index
    while (endIndex + 1 < schedule.length && areSameTime(current, schedule[endIndex + 1])) {
      endIndex += 1
    }
    lines.push(`${toDayLabel(index, endIndex)} ${current.from}-${current.to}`)
    index = endIndex + 1
  }

  const cleanedNotes = notes
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  return [...lines, ...cleanedNotes].join('\n')
}
