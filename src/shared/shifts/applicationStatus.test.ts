import { describe, it, expect } from 'vitest'
import {
  normalizeApplicationStatus,
  getApplicationStatus,
  getApplicationId,
} from './applicationStatus'

describe('normalizeApplicationStatus', () => {
  it('accepted/rejected проходят как есть', () => {
    expect(normalizeApplicationStatus('accepted')).toBe('accepted')
    expect(normalizeApplicationStatus('rejected')).toBe('rejected')
  })
  it('всё прочее → pending', () => {
    expect(normalizeApplicationStatus('pending')).toBe('pending')
    expect(normalizeApplicationStatus('processing')).toBe('pending')
    expect(normalizeApplicationStatus(null)).toBe('pending')
    expect(normalizeApplicationStatus(undefined)).toBe('pending')
  })
})

describe('getApplicationStatus', () => {
  it('shift_application_status имеет приоритет над status', () => {
    expect(getApplicationStatus({ shift_application_status: 'accepted', status: 'pending' })).toBe(
      'accepted'
    )
  })
  it('fallback на status, затем pending', () => {
    expect(getApplicationStatus({ status: 'rejected' })).toBe('rejected')
    expect(getApplicationStatus({})).toBe('pending')
    expect(getApplicationStatus(null)).toBe('pending')
  })
})

describe('getApplicationId', () => {
  it('shift_application_id имеет приоритет над id', () => {
    expect(getApplicationId({ shift_application_id: 5, id: 9 })).toBe(5)
  })
  it('fallback на id, затем null', () => {
    expect(getApplicationId({ id: 9 })).toBe(9)
    expect(getApplicationId({})).toBeNull()
    expect(getApplicationId(undefined)).toBeNull()
  })
})
