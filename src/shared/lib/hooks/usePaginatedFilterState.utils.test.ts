import { describe, expect, it } from 'vitest'
import { resolveResetFilters } from './usePaginatedFilterState.utils'

describe('resolveResetFilters', () => {
  it('returns default filters when custom reset strategy is absent', () => {
    const defaults = { city: 'Minsk', onlyActive: true }
    expect(resolveResetFilters(defaults)).toEqual(defaults)
  })

  it('uses custom reset strategy when provided', () => {
    const defaults = { city: 'Minsk', onlyActive: true }
    expect(
      resolveResetFilters(defaults, current => ({
        ...current,
        city: '',
      }))
    ).toEqual({ city: '', onlyActive: true })
  })
})
