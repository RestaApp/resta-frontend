import { describe, expect, it } from 'vitest'
import { vacancyToShift } from './mapping'
import type { VacancyApiItem } from '@/services/api/shiftsApi'

const item = (overrides: Partial<VacancyApiItem> = {}): VacancyApiItem =>
  ({
    id: 1,
    position: 'chef',
    payment: 100,
    shift_type: 'replacement',
    ...overrides,
  }) as VacancyApiItem

describe('mapping · vacancyToShift время', () => {
  it('реальное окно (start < end) → время непустое', () => {
    const shift = vacancyToShift(
      item({ start_time: '2026-01-11 08:00:00 +0000', end_time: '2026-01-11 16:00:00 +0000' })
    )
    expect(shift.time).not.toBe('')
    expect(shift.time).toContain('–')
  })

  it('только start без end → время пустое (не вводим в заблуждение)', () => {
    const shift = vacancyToShift(item({ start_time: '2026-01-11 08:00:00 +0000' }))
    expect(shift.time).toBe('')
  })

  it('нет времени вовсе → пустое', () => {
    expect(vacancyToShift(item()).time).toBe('')
  })

  it('end <= start → время пустое', () => {
    const shift = vacancyToShift(
      item({ start_time: '2026-01-11 08:00:00 +0000', end_time: '2026-01-11 08:00:00 +0000' })
    )
    expect(shift.time).toBe('')
  })
})
