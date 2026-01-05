/**
 * Утилиты для клиентских фильтров (не поддерживаются API)
 */

import type { Shift } from '../types'

export type QuickFilter = 'all' | 'urgent' | 'high_pay' | 'nearby' | 'my_role'

/**
 * Применяет клиентские быстрые фильтры к списку смен
 * @param shifts - Список смен для фильтрации
 * @param activeFilter - Активный фильтр ('high_pay' | 'nearby' | 'my_role' | 'urgent' | 'all')
 * @param userPosition - Позиция пользователя для фильтра 'my_role'
 * @returns Отфильтрованный список смен
 */
export const applyClientQuickFilters = (args: {
  shifts: Shift[]
  quickFilter: QuickFilter
  userPosition?: string | null
}): Shift[] => {
  const { shifts, quickFilter, userPosition } = args
  let result = [...shifts]

  // Быстрые фильтры, которые требуют клиентской обработки
  switch (quickFilter) {
    case 'high_pay':
      // Сортируем по оплате и берем топ 30%
      result = result.sort((a, b) => b.pay - a.pay).slice(0, Math.ceil(result.length * 0.3))
      break
    case 'nearby':
      // TODO: Реализовать сортировку по дистанции когда будет геолокация
      // Пока просто сортируем по алфавиту
      result = result.sort((a, b) => a.location?.localeCompare(b.location || '') || 0)
      break
    case 'my_role':
      if (userPosition) {
        result = result.filter(s => {
          const shiftPosition = s.position.toLowerCase()
          const userPos = userPosition.toLowerCase()
          return shiftPosition.includes(userPos) || userPos.includes(shiftPosition)
        })
      }
      break
    case 'urgent':
    case 'all':
    default:
      // urgent и все остальное уже обработано на сервере
      break
  }

  return result
}
