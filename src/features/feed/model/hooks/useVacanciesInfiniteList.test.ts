import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GetVacanciesParams } from '@/services/api/shiftsApi'
import { resolveVacanciesHasMore, useVacanciesInfiniteList } from './useVacanciesInfiniteList'

const useGetVacanciesQuery = vi.fn()
const fetchVacancies = vi.fn()

vi.mock('@/services/api/shiftsApi', () => ({
  useGetVacanciesQuery: (params: GetVacanciesParams) => useGetVacanciesQuery(params),
  useLazyGetVacanciesQuery: () => [fetchVacancies],
}))

describe('resolveVacanciesHasMore', () => {
  it('stops when backend reports next_page as null even if total_count is larger', () => {
    expect(
      resolveVacanciesHasMore({
        current_page: 1,
        next_page: null,
        total_pages: 1,
        total_count: 250,
      })
    ).toBe(false)
  })

  it('continues when backend exposes next_page', () => {
    expect(
      resolveVacanciesHasMore({
        current_page: 1,
        next_page: 2,
        total_pages: 2,
      })
    ).toBe(true)
  })
})

describe('useVacanciesInfiniteList — refresh', () => {
  const baseQuery = {}
  const renderList = () =>
    renderHook(() => useVacanciesInfiniteList({ shiftType: 'vacancy', baseQuery, enabled: true }))
  const lastQueriedPage = () => useGetVacanciesQuery.mock.lastCall?.[0]?.page

  beforeEach(() => {
    vi.clearAllMocks()
    useGetVacanciesQuery.mockReturnValue({
      data: { success: true, data: [], pagination: { current_page: 1, next_page: 2 } },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: undefined,
    })
  })

  it('после догрузки страниц запрашивает первую и ждёт её ответа', async () => {
    let resolveFirstPage: () => void = () => undefined
    fetchVacancies.mockReturnValue(
      new Promise<void>(resolve => {
        resolveFirstPage = resolve
      })
    )
    const { result } = renderList()

    act(() => result.current.loadMore())
    expect(lastQueriedPage()).toBe(2)

    let isSettled = false
    let refreshing: Promise<void> = Promise.resolve()
    act(() => {
      refreshing = result.current.refresh().then(() => {
        isSettled = true
      })
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(fetchVacancies).toHaveBeenCalledWith(
      expect.objectContaining({ shift_type: 'vacancy', page: 1 })
    )
    expect(lastQueriedPage()).toBe(1)
    // Запрос ещё в полёте — refresh не завершён, спиннер pull-to-refresh держится.
    expect(isSettled).toBe(false)

    await act(async () => {
      resolveFirstPage()
      await refreshing
    })
    expect(isSettled).toBe(true)
  })

  it('не обращается к сети, когда список выключен', async () => {
    const { result } = renderHook(() =>
      useVacanciesInfiniteList({ shiftType: 'vacancy', baseQuery, enabled: false })
    )

    await act(async () => {
      await result.current.refresh()
    })

    expect(fetchVacancies).not.toHaveBeenCalled()
  })
})
