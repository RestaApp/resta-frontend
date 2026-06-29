import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Мокаем fetchBaseQuery так, чтобы `rawBaseQuery` стал управляемым моком —
 * это позволяет точечно проверить логику реавторизации (single-flight refresh,
 * logout-on-failure, ретраи), не поднимая реальный fetch для самих запросов.
 * `retry` оставляем настоящим.
 */
const { mockRawBaseQuery } = vi.hoisted(() => ({ mockRawBaseQuery: vi.fn() }))
vi.mock('@reduxjs/toolkit/query', async importOriginal => {
  const actual = await importOriginal<typeof import('@reduxjs/toolkit/query')>()
  return { ...actual, fetchBaseQuery: () => mockRawBaseQuery }
})

vi.mock('@/services/auth', () => ({
  authService: { getToken: vi.fn(), logout: vi.fn() },
}))
vi.mock('@/shared/api/authRefresh', () => ({
  applyAuthRefreshPayload: vi.fn(),
}))

import { authService } from '@/services/auth'
import { applyAuthRefreshPayload } from '@/shared/api/authRefresh'
import { authSessionExpired } from '@/shared/api/authEvents'
import { baseQueryWithReauth, shouldRetry } from './rtkQuery'

const auth = vi.mocked(authService)
const applyRefresh = vi.mocked(applyAuthRefreshPayload)

const apiCtx = () => ({ dispatch: vi.fn() }) as never
const ctxWith = (dispatch: ReturnType<typeof vi.fn>) => ({ dispatch }) as never

// Мокаем глобальный fetch — его дёргает только refreshToken (data-запросы идут через rawBaseQuery).
const fetchMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  auth.getToken.mockReturnValue('access-token')
  applyRefresh.mockReturnValue(true)
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ meta: { token: 'new' } }) })
  globalThis.fetch = fetchMock as never
})

describe('baseQueryWithReauth', () => {
  it('успешный запрос возвращается без рефреша', async () => {
    mockRawBaseQuery.mockResolvedValueOnce({ data: { ok: true } })

    const res = await baseQueryWithReauth('/x', apiCtx(), {})

    expect(res).toEqual({ data: { ok: true } })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(mockRawBaseQuery).toHaveBeenCalledTimes(1)
  })

  it('не 401 ошибка возвращается как есть, без рефреша', async () => {
    mockRawBaseQuery.mockResolvedValueOnce({ error: { status: 500 } })

    const res = await baseQueryWithReauth('/x', apiCtx(), {})

    expect(res).toEqual({ error: { status: 500 } })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(auth.logout).not.toHaveBeenCalled()
  })

  it('401 → refresh ok → повтор исходного запроса', async () => {
    mockRawBaseQuery
      .mockResolvedValueOnce({ error: { status: 401 } })
      .mockResolvedValueOnce({ data: { ok: true } })

    const res = await baseQueryWithReauth('/x', apiCtx(), {})

    expect(res).toEqual({ data: { ok: true } })
    expect(fetchMock).toHaveBeenCalledTimes(1) // один refresh
    expect(mockRawBaseQuery).toHaveBeenCalledTimes(2) // исходный + повтор
    expect(auth.logout).not.toHaveBeenCalled()
  })

  it('401 → refresh fail → logout + authSessionExpired, возвращается исходная ошибка', async () => {
    applyRefresh.mockReturnValue(false)
    mockRawBaseQuery.mockResolvedValueOnce({ error: { status: 401 } })
    const dispatch = vi.fn()

    const res = await baseQueryWithReauth('/x', ctxWith(dispatch), {})

    expect(res).toEqual({ error: { status: 401 } })
    expect(auth.logout).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith(authSessionExpired())
    expect(mockRawBaseQuery).toHaveBeenCalledTimes(1) // повтора нет
  })

  it('нет токена → refresh не делает запрос, сразу logout', async () => {
    auth.getToken.mockReturnValue(null)
    mockRawBaseQuery.mockResolvedValueOnce({ error: { status: 401 } })

    const res = await baseQueryWithReauth('/x', apiCtx(), {})

    expect(res).toEqual({ error: { status: 401 } })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(auth.logout).toHaveBeenCalledTimes(1)
  })

  it('refresh HTTP не ok → logout', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) })
    mockRawBaseQuery.mockResolvedValueOnce({ error: { status: 401 } })

    const res = await baseQueryWithReauth('/x', apiCtx(), {})

    expect(res).toEqual({ error: { status: 401 } })
    expect(auth.logout).toHaveBeenCalledTimes(1)
  })

  it('параллельные 401 делят один refresh (single-flight)', async () => {
    // оба исходных запроса → 401, оба повтора → success
    mockRawBaseQuery.mockImplementation(() => {
      const call = mockRawBaseQuery.mock.calls.length
      return Promise.resolve(call <= 2 ? { error: { status: 401 } } : { data: { ok: true } })
    })
    // refresh резолвится с задержкой, чтобы оба запроса застали общий promise
    fetchMock.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ ok: true, json: async () => ({ meta: { token: 'n' } }) }), 5)
        )
    )

    const [a, b] = await Promise.all([
      baseQueryWithReauth('/a', apiCtx(), {}),
      baseQueryWithReauth('/b', apiCtx(), {}),
    ])

    expect(a).toEqual({ data: { ok: true } })
    expect(b).toEqual({ data: { ok: true } })
    expect(fetchMock).toHaveBeenCalledTimes(1) // refresh случился ровно один раз
  })
})

describe('shouldRetry', () => {
  const run = (status: unknown, attempt: number, data?: unknown) =>
    shouldRetry({ status, data }, '/x', { attempt })

  it('ретраит 408/429/5xx', () => {
    expect(run(408, 1)).toBe(true)
    expect(run(429, 1)).toBe(true)
    expect(run(500, 1)).toBe(true)
    expect(run(503, 1)).toBe(true)
  })

  it('не ретраит 4xx (кроме 408/429)', () => {
    expect(run(400, 1)).toBe(false)
    expect(run(404, 1)).toBe(false)
    expect(run(401, 1)).toBe(false)
  })

  it('не ретраит profile_incomplete даже на 5xx', () => {
    expect(run(500, 1, { code: 'profile_incomplete' })).toBe(false)
  })

  it('перестаёт ретраить после MAX_RETRIES (2)', () => {
    expect(run(500, 2)).toBe(true)
    expect(run(500, 3)).toBe(false)
  })
})
