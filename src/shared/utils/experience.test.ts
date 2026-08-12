import { describe, expect, it } from 'vitest'
import { formatExperienceText } from './experience'

describe('formatExperienceText', () => {
  it('показывает точный опыт до пяти лет', () => {
    expect(formatExperienceText(0)).toBe('Без опыта')
    expect(formatExperienceText(1)).toBe('1 год')
    expect(formatExperienceText(5)).toBe('5 лет')
  })

  it('сворачивает опыт больше пяти лет в 5+', () => {
    expect(formatExperienceText(6)).toBe('5+ лет')
    expect(formatExperienceText(50)).toBe('5+ лет')
  })
})
