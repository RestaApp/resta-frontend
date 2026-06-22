import { describe, it, expect } from 'vitest'
import { addDaysToISODate, getTodayDateISO } from '@/shared/utils/datetime'
import type { AdvancedFiltersData } from './types'
import {
  resolveSalaryRangeParams,
  resolveDateFilterParams,
  hasActiveDateFilter,
} from './filterMappings'

describe('resolveSalaryRangeParams', () => {
  it('посменные диапазоны (min/max)', () => {
    expect(resolveSalaryRangeParams('0-80')).toEqual({ min_payment: 0, max_payment: 80 })
    expect(resolveSalaryRangeParams('160+')).toEqual({ min_payment: 160 })
  })
  it('месячные диапазоны вакансий', () => {
    expect(resolveSalaryRangeParams('0-1000')).toEqual({ min_payment: 0, max_payment: 1000 })
    expect(resolveSalaryRangeParams('2500+')).toEqual({ min_payment: 2500 })
  })
  it('неизвестный id → {}', () => {
    expect(resolveSalaryRangeParams('nope')).toEqual({})
    expect(resolveSalaryRangeParams(null)).toEqual({})
  })
})

const adv = (over: Partial<AdvancedFiltersData>): AdvancedFiltersData => over as AdvancedFiltersData

describe('resolveDateFilterParams', () => {
  const today = getTodayDateISO()

  it('today', () => {
    expect(resolveDateFilterParams(adv({ selectedDatePreset: 'today' }))).toEqual({
      start_date: today,
      end_date: today,
    })
  })
  it('tomorrow', () => {
    const tomorrow = addDaysToISODate(today, 1)
    expect(resolveDateFilterParams(adv({ selectedDatePreset: 'tomorrow' }))).toEqual({
      start_date: tomorrow,
      end_date: tomorrow,
    })
  })
  it('week: начинается сегодня, заканчивается не раньше', () => {
    const r = resolveDateFilterParams(adv({ selectedDatePreset: 'week' }))
    expect(r.start_date).toBe(today)
    expect(r.end_date! >= today).toBe(true)
  })
  it('custom: end по умолчанию = start', () => {
    expect(
      resolveDateFilterParams(adv({ selectedDatePreset: 'custom', customStartDate: '2026-07-01' }))
    ).toEqual({ start_date: '2026-07-01', end_date: '2026-07-01' })
  })
  it('custom без start → {}', () => {
    expect(resolveDateFilterParams(adv({ selectedDatePreset: 'custom' }))).toEqual({})
  })
  it('без пресета → {}', () => {
    expect(resolveDateFilterParams(adv({}))).toEqual({})
  })
})

describe('hasActiveDateFilter', () => {
  it('пресет активен', () => {
    expect(hasActiveDateFilter(adv({ selectedDatePreset: 'today' }))).toBe(true)
  })
  it('custom активен только со start', () => {
    expect(
      hasActiveDateFilter(adv({ selectedDatePreset: 'custom', customStartDate: '2026-07-01' }))
    ).toBe(true)
    expect(hasActiveDateFilter(adv({ selectedDatePreset: 'custom' }))).toBe(false)
  })
  it('без пресета — false', () => {
    expect(hasActiveDateFilter(adv({}))).toBe(false)
  })
})
