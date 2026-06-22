import { describe, it, expect } from 'vitest'
import type { TFunction } from 'i18next'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { findDuplicatePosition, validateTimeRange } from './addShiftValidation'

const t = ((key: string) => key) as unknown as TFunction

const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

const shift = (over: Partial<VacancyApiItem>): VacancyApiItem =>
  ({ id: 1, title: '', position: 'chef', start_time: future, ...over }) as VacancyApiItem

describe('findDuplicatePosition', () => {
  it('false при пустой позиции или пустом списке', () => {
    expect(findDuplicatePosition([shift({})], '', undefined)).toBe(false)
    expect(findDuplicatePosition([], 'chef', undefined)).toBe(false)
  })

  it('true: та же позиция и end_time в будущем', () => {
    expect(findDuplicatePosition([shift({ end_time: future })], 'chef', undefined)).toBe(true)
  })

  it('false: та же позиция, но end_time в прошлом (неактивна)', () => {
    expect(findDuplicatePosition([shift({ end_time: past })], 'chef', undefined)).toBe(false)
  })

  it('true: только start_time в будущем (без end_time)', () => {
    expect(findDuplicatePosition([shift({ start_time: future })], 'chef', undefined)).toBe(true)
  })

  it('false: другая позиция', () => {
    expect(findDuplicatePosition([shift({ position: 'waiter' })], 'chef', undefined)).toBe(false)
  })

  it('false: пропускает редактируемую смену по currentId', () => {
    expect(findDuplicatePosition([shift({ id: 7, end_time: future })], 'chef', 7)).toBe(false)
  })

  it('false: нет start_time', () => {
    expect(findDuplicatePosition([shift({ start_time: undefined })], 'chef', undefined)).toBe(false)
  })

  it('true: невалидная дата считается активной (B3 — консервативно)', () => {
    expect(
      findDuplicatePosition(
        [shift({ start_time: 'not-a-date', end_time: 'nope' })],
        'chef',
        undefined
      )
    ).toBe(true)
  })
})

describe('validateTimeRange', () => {
  it('null, если одно из полей пустое', () => {
    expect(validateTimeRange('', '18:00', t)).toBeNull()
    expect(validateTimeRange('10:00', '', t)).toBeNull()
  })

  it('ночная смена (конец < начала) допустима', () => {
    expect(validateTimeRange('22:00', '06:00', t)).toBeNull()
  })

  it('равные время начала и конца — ошибка', () => {
    expect(validateTimeRange('10:00', '10:00', t)).toBe('validation.timeEndAfterStart')
  })

  it('нормальный диапазон — null', () => {
    expect(validateTimeRange('10:00', '18:00', t)).toBeNull()
  })
})
