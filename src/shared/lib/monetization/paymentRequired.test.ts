import { describe, expect, it } from 'vitest'
import { isContactRevealPaymentRequired, parsePaymentRequired } from './paymentRequired'

describe('parsePaymentRequired', () => {
  it('402 с полным телом → разобранная инфа', () => {
    const result = parsePaymentRequired({
      status: 402,
      data: {
        error: 'Purchase required to perform this action.',
        feature: 'create_vacancy',
        upgrade_available: true,
        purchase_type: 'vacancy_slot',
        price: 50,
      },
    })
    expect(result).toEqual({
      purchaseType: 'vacancy_slot',
      price: 50,
      feature: 'create_vacancy',
      upgradeAvailable: true,
    })
  })

  it('402 без price → price 0, feature опционален', () => {
    const result = parsePaymentRequired({
      status: 402,
      data: { purchase_type: 'urgent_boost', upgrade_available: false },
    })
    expect(result).toEqual({ purchaseType: 'urgent_boost', price: 0, upgradeAvailable: false })
  })

  it('не 402 → null', () => {
    expect(
      parsePaymentRequired({ status: 422, data: { purchase_type: 'vacancy_slot' } })
    ).toBeNull()
  })

  it('402 без валидного purchase_type → null', () => {
    expect(
      parsePaymentRequired({ status: 402, data: { purchase_type: 'bogus', price: 10 } })
    ).toBeNull()
    expect(parsePaymentRequired({ status: 402, data: {} })).toBeNull()
  })

  it('мусор на входе → null', () => {
    expect(parsePaymentRequired(null)).toBeNull()
    expect(parsePaymentRequired(undefined)).toBeNull()
    expect(parsePaymentRequired('error')).toBeNull()
    expect(parsePaymentRequired({ status: 402 })).toBeNull()
  })
})

describe('isContactRevealPaymentRequired', () => {
  it('распознаёт минимальный 402-контракт reveal endpoint', () => {
    expect(
      isContactRevealPaymentRequired({ status: 402, data: { code: 'purchase_required' } })
    ).toBe(true)
  })

  it('не принимает другие ошибки', () => {
    expect(
      isContactRevealPaymentRequired({ status: 422, data: { code: 'purchase_required' } })
    ).toBe(false)
    expect(isContactRevealPaymentRequired({ status: 402, data: { code: 'validation' } })).toBe(
      false
    )
  })
})
