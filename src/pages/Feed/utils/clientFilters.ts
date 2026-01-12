import type { Shift } from '../types'

export type QuickFilter = 'all' | 'urgent' | 'high_pay' | 'nearby' | 'my_role'

export const applyClientQuickFilters = (args: {
  shifts: Shift[]
  quickFilter: QuickFilter
  userPosition?: string | null
}): Shift[] => {
  const { shifts, quickFilter, userPosition } = args

  // базово не мутируем
  const src = shifts.slice()

  switch (quickFilter) {
    case 'high_pay': {
      if (src.length === 0) return src
      const sorted = src.slice().sort((a, b) => b.pay - a.pay)
      const take = Math.max(1, Math.ceil(sorted.length * 0.3))
      return sorted.slice(0, take)
    }

    case 'nearby': {
      // пока нет гео — оставим стабильную сортировку по location
      return src.slice().sort((a, b) => (a.location ?? '').localeCompare(b.location ?? ''))
    }

    case 'my_role': {
      if (!userPosition) return src
      const userPos = userPosition.toLowerCase()
      return src.filter(s => {
        const shiftPos = (s.position ?? '').toLowerCase()
        return shiftPos.includes(userPos) || userPos.includes(shiftPos)
      })
    }

    case 'urgent':
    case 'all':
    default:
      // urgent и базовые фильтры уже на сервере
      return src
  }
}
