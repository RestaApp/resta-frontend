import { describe, it, expect } from 'vitest'
import { parseShiftDetailFromResponse } from './shiftsApi.types'

describe('parseShiftDetailFromResponse', () => {
  it('возвращает data из оболочки success/data', () => {
    const item = { id: 1, title: 'T' }
    expect(parseShiftDetailFromResponse({ success: true, data: item })).toBe(item)
  })

  it('бросает на null / не-объекте', () => {
    expect(() => parseShiftDetailFromResponse(null)).toThrow()
    expect(() => parseShiftDetailFromResponse('x')).toThrow()
  })

  it('бросает при отсутствии data', () => {
    expect(() => parseShiftDetailFromResponse({ success: true })).toThrow()
    expect(() => parseShiftDetailFromResponse({ success: true, data: null })).toThrow()
  })
})
