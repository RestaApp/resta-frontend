import { describe, expect, it } from 'vitest'
import { getConfirmedSharedPhone, resolvePreferredPhone } from './telegramConfirmStep.utils'

describe('telegramConfirmStep.utils', () => {
  it('prefers manual phone over phone from profile', () => {
    expect(
      resolvePreferredPhone({
        manualPhone: '+375 (29) 123-45-67',
        phoneFromProfile: '+375291111111',
      })
    ).toBe('+375 (29) 123-45-67')
  })

  it('falls back to profile phone when manual phone is empty', () => {
    expect(
      resolvePreferredPhone({
        manualPhone: '   ',
        phoneFromProfile: '+375291111111',
      })
    ).toBe('+375291111111')
  })

  it('returns null when shared phone was not confirmed by backend', () => {
    expect(getConfirmedSharedPhone(null)).toBeNull()
    expect(getConfirmedSharedPhone('   ')).toBeNull()
  })

  it('normalizes confirmed shared phone', () => {
    expect(getConfirmedSharedPhone('+375291234567')).toBe('+375-29-123-45-67')
  })
})
