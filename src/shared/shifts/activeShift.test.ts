import { describe, expect, it } from 'vitest'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { findEditableEmployeeShift, hasActiveEmployeeShift } from './activeShift'

const HOUR_MS = 60 * 60 * 1000
const future = new Date(Date.now() + 2 * HOUR_MS).toISOString()
const past = new Date(Date.now() - 2 * HOUR_MS).toISOString()

const vacancy = (overrides: Partial<VacancyApiItem> = {}): VacancyApiItem =>
  ({
    id: 1,
    status: 'open',
    shift_type: 'replacement',
    start_time: future,
    end_time: future,
    ...overrides,
  }) as VacancyApiItem

describe('findEditableEmployeeShift', () => {
  it('возвращает активную открытую смену', () => {
    const shift = vacancy()

    expect(findEditableEmployeeShift([shift])).toBe(shift)
  })

  it.each(['filled', 'completed', 'cancelled', 'closed'])(
    'не возвращает смену со статусом %s',
    status => {
      expect(findEditableEmployeeShift([vacancy({ status })])).toBeNull()
    }
  )

  it('не возвращает смену с уже выбранным кандидатом', () => {
    const shift = vacancy({ selected_applicant: { user_id: 2, full_name: 'Иван Петров' } })

    expect(findEditableEmployeeShift([shift])).toBeNull()
  })

  it('не возвращает истёкшую смену', () => {
    expect(findEditableEmployeeShift([vacancy({ start_time: past, end_time: past })])).toBeNull()
  })

  it('заполненная смена остаётся активной: «+» недоступен, но редактировать нечего', () => {
    const shifts = [vacancy({ status: 'filled' })]

    expect(hasActiveEmployeeShift(shifts)).toBe(true)
    expect(findEditableEmployeeShift(shifts)).toBeNull()
  })
})
