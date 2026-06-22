import { describe, it, expect } from 'vitest'
import { normalizeVacanciesResponse } from './normalizeShiftsResponse'

describe('normalizeVacanciesResponse', () => {
  it('массив возвращается как есть', () => {
    const arr = [{ id: 1 }, { id: 2 }]
    expect(normalizeVacanciesResponse(arr)).toBe(arr)
  })
  it('{ data: [...] } разворачивается', () => {
    expect(normalizeVacanciesResponse({ data: [{ id: 1 }] })).toEqual([{ id: 1 }])
  })
  it('null / не-объект / пустой объект → []', () => {
    expect(normalizeVacanciesResponse(null)).toEqual([])
    expect(normalizeVacanciesResponse(undefined)).toEqual([])
    expect(normalizeVacanciesResponse('x')).toEqual([])
    expect(normalizeVacanciesResponse({})).toEqual([])
  })
  it('{ data: не-массив } → []', () => {
    expect(normalizeVacanciesResponse({ data: 'oops' })).toEqual([])
  })
})
