import { describe, expect, it } from 'vitest'
import {
  mergeVacanciesPages,
  serializeVacanciesQueryArgs,
  type VacanciesResponse,
} from './shiftsApi'

const createResponse = (
  ids: number[],
  pagination?: VacanciesResponse['pagination']
): VacanciesResponse => ({
  success: true,
  data: ids.map(id => ({
    id,
    title: `Shift ${id}`,
  })),
  pagination,
})

describe('shiftsApi getVacancies pagination helpers', () => {
  it('does not include page in cache key', () => {
    expect(
      serializeVacanciesQueryArgs({
        queryArgs: {
          shift_type: 'vacancy',
          city: 'Warsaw',
          per_page: 5,
          page: 1,
        },
      })
    ).toEqual({
      shift_type: 'vacancy',
      city: 'Warsaw',
      per_page: 5,
    })
  })

  it('appends new pages and upserts overlapping items', () => {
    const currentCache = createResponse([1, 2], {
      current_page: 1,
      next_page: 2,
      total_pages: 3,
    })
    const nextPage = createResponse([2, 3], {
      current_page: 2,
      next_page: 3,
      total_pages: 3,
    })

    mergeVacanciesPages(currentCache, nextPage, 2)

    expect(currentCache.data.map(item => item.id)).toEqual([1, 2, 3])
    expect(currentCache.pagination).toEqual(nextPage.pagination)
  })

  it('replaces cache on first page refresh', () => {
    const currentCache = createResponse([1, 2], {
      current_page: 2,
      next_page: 3,
      total_pages: 3,
    })
    const firstPage = createResponse([10, 11], {
      current_page: 1,
      next_page: 2,
      total_pages: 3,
    })

    expect(mergeVacanciesPages(currentCache, firstPage, 1)).toEqual(firstPage)
  })
})
