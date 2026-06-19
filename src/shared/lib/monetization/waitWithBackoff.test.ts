import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { waitWithBackoff } from './waitWithBackoff'

describe('waitWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('резолвит первым не-null значением и прекращает попытки', async () => {
    const attempt = vi
      .fn<(i: number) => Promise<string | null>>()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('ok')

    const promise = waitWithBackoff(attempt, 5, 100)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBe('ok')
    expect(attempt).toHaveBeenCalledTimes(2)
  })

  it('возвращает null после исчерпания попыток', async () => {
    const attempt = vi.fn<(i: number) => Promise<string | null>>().mockResolvedValue(null)

    const promise = waitWithBackoff(attempt, 3, 100)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBeNull()
    expect(attempt).toHaveBeenCalledTimes(3)
  })

  it('0 не считается «пустым» (только null/undefined)', async () => {
    const attempt = vi.fn<(i: number) => Promise<number | null>>().mockResolvedValue(0)

    const promise = waitWithBackoff(attempt, 3, 100)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBe(0)
    expect(attempt).toHaveBeenCalledTimes(1)
  })
})
