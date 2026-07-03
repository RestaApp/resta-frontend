import { describe, expect, it } from 'vitest'
import { resolveVacanciesHasMore } from './useVacanciesInfiniteList'

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
