import { useMemo, useState } from 'react'

export interface CalendarDay {
  iso: string
  day: number
  disabled: boolean
}

interface UseCalendarOptions {
  initialDate?: string | null
  minDate?: string
  locale?: string
}

export function useCalendar({ initialDate, minDate, locale = 'en' }: UseCalendarOptions = {}) {
  const parsed = initialDate ? new Date(`${initialDate}T00:00:00`) : new Date()
  const [viewYear, setViewYear] = useState(parsed.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed.getMonth())

  const monthLabel = useMemo(() => {
    return `${String(viewMonth + 1).padStart(2, '0')}/${viewYear}`
  }, [viewYear, viewMonth])

  const dayHeaders = useMemo(() => {
    const base = new Date(2024, 0, 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      return d.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2).toUpperCase()
    })
  }, [locale])

  const days = useMemo(() => {
    const result: (CalendarDay | null)[] = []
    const firstDay = new Date(viewYear, viewMonth, 1)
    let startDow = firstDay.getDay()
    if (startDow === 0) startDow = 7

    for (let i = 1; i < startDow; i++) {
      result.push(null)
    }

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      let disabled = false
      if (minDate && iso < minDate) {
        disabled = true
      }
      result.push({ iso, day: d, disabled })
    }

    return result
  }, [viewYear, viewMonth, minDate])

  const goToPrevMonth = () => {
    setViewMonth(prev => {
      if (prev === 0) {
        setViewYear(y => y - 1)
        return 11
      }
      return prev - 1
    })
  }

  const goToNextMonth = () => {
    setViewMonth(prev => {
      if (prev === 11) {
        setViewYear(y => y + 1)
        return 0
      }
      return prev + 1
    })
  }

  return {
    viewYear,
    viewMonth,
    monthLabel,
    dayHeaders,
    days,
    goToPrevMonth,
    goToNextMonth,
  }
}
