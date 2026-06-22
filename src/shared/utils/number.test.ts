import { describe, it, expect } from 'vitest'
import { toFiniteNumber, toFiniteNumberOrNull } from './number'

describe('toFiniteNumber', () => {
  it('числа проходят, NaN/Infinity → fallback', () => {
    expect(toFiniteNumber(5)).toBe(5)
    expect(toFiniteNumber(0)).toBe(0)
    expect(toFiniteNumber(NaN)).toBe(0)
    expect(toFiniteNumber(Infinity)).toBe(0)
  })
  it('числовые строки парсятся, мусор → fallback', () => {
    expect(toFiniteNumber('12.5')).toBe(12.5)
    expect(toFiniteNumber('abc')).toBe(0)
    expect(toFiniteNumber('abc', -1)).toBe(-1)
  })
  it('null/undefined: Number()-семантика (null→0, undefined→fallback)', () => {
    expect(toFiniteNumber(null)).toBe(0)
    expect(toFiniteNumber(undefined)).toBe(0)
    expect(toFiniteNumber(undefined, 7)).toBe(7)
  })
})

describe('toFiniteNumberOrNull', () => {
  it('число или null', () => {
    expect(toFiniteNumberOrNull(3)).toBe(3)
    expect(toFiniteNumberOrNull('3')).toBe(3)
    expect(toFiniteNumberOrNull('x')).toBeNull()
    expect(toFiniteNumberOrNull(NaN)).toBeNull()
  })
})
