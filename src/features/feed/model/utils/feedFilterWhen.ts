/** Быстрый выбор периода для фильтра смен («Сегодня» / «Завтра» / «Эта неделя»). */

export type WhenPreset = 'today' | 'tomorrow' | 'week'

const pad2 = (n: number) => String(n).padStart(2, '0')

export const formatLocalDateKey = (date: Date): string => {
  const yyyy = date.getFullYear()
  const mm = pad2(date.getMonth() + 1)
  const dd = pad2(date.getDate())
  return `${yyyy}-${mm}-${dd}`
}

const startOfLocalDay = (d: Date): Date => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

const addDays = (d: Date, n: number): Date => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/**
 * Понедельник–воскресенье календарной недели, в которой лежит `anchor`.
 * Пн = 1 … Вс = 0 (getDay).
 */
export const getMondaySundayOfWeek = (anchor: Date): { monday: Date; sunday: Date } => {
  const day = startOfLocalDay(anchor)
  const dow = day.getDay() // 0 Вс … 6 Сб
  const offsetToMonday = dow === 0 ? -6 : 1 - dow
  const monday = addDays(day, offsetToMonday)
  const sunday = addDays(monday, 6)
  return { monday, sunday }
}

export const getWhenPresetRange = (preset: WhenPreset): { startDate: string; endDate: string } => {
  const today = startOfLocalDay(new Date())
  if (preset === 'today') {
    const k = formatLocalDateKey(today)
    return { startDate: k, endDate: k }
  }
  if (preset === 'tomorrow') {
    const t = addDays(today, 1)
    const k = formatLocalDateKey(t)
    return { startDate: k, endDate: k }
  }
  const { monday, sunday } = getMondaySundayOfWeek(today)
  return { startDate: formatLocalDateKey(monday), endDate: formatLocalDateKey(sunday) }
}
