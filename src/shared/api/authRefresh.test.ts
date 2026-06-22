import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/auth', () => ({
  authService: { setToken: vi.fn(), setRefreshToken: vi.fn() },
}))

import { authService } from '@/services/auth'
import { applyAuthRefreshPayload } from './authRefresh'

const auth = vi.mocked(authService)

beforeEach(() => {
  auth.setToken.mockClear()
  auth.setRefreshToken.mockClear()
})

describe('applyAuthRefreshPayload', () => {
  it('формат meta.token', () => {
    expect(applyAuthRefreshPayload({ meta: { token: 'A' } })).toBe(true)
    expect(auth.setToken).toHaveBeenCalledWith('A')
  })

  it('формат accessToken (+refreshToken)', () => {
    expect(applyAuthRefreshPayload({ accessToken: 'B', refreshToken: 'R' })).toBe(true)
    expect(auth.setToken).toHaveBeenCalledWith('B')
    expect(auth.setRefreshToken).toHaveBeenCalledWith('R')
  })

  it('формат data.token', () => {
    expect(applyAuthRefreshPayload({ data: { token: 'C' } })).toBe(true)
    expect(auth.setToken).toHaveBeenCalledWith('C')
  })

  it('приоритет meta > accessToken > data', () => {
    applyAuthRefreshPayload({ meta: { token: 'M' }, accessToken: 'A', data: { token: 'D' } })
    expect(auth.setToken).toHaveBeenCalledTimes(1)
    expect(auth.setToken).toHaveBeenCalledWith('M')
  })

  it('refreshToken не ставится без accessToken', () => {
    applyAuthRefreshPayload({ meta: { token: 'M' }, refreshToken: 'R' })
    expect(auth.setRefreshToken).not.toHaveBeenCalled()
  })

  it('false на null/пустой/пустую строку токена', () => {
    expect(applyAuthRefreshPayload(null)).toBe(false)
    expect(applyAuthRefreshPayload({})).toBe(false)
    expect(applyAuthRefreshPayload({ meta: { token: '' } })).toBe(false)
    expect(auth.setToken).not.toHaveBeenCalled()
  })
})
