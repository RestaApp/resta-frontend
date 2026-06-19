import { afterEach, describe, expect, it } from 'vitest'
import { isRoleTourSeen, markRoleTourSeen } from './useRoleTour'

describe('role tour seen-флаг', () => {
  afterEach(() => localStorage.clear())

  it('по умолчанию тур не просмотрен', () => {
    expect(isRoleTourSeen('chef')).toBe(false)
  })

  it('markRoleTourSeen помечает только указанную роль', () => {
    markRoleTourSeen('chef')
    expect(isRoleTourSeen('chef')).toBe(true)
    expect(isRoleTourSeen('venue')).toBe(false)
    expect(isRoleTourSeen('supplier')).toBe(false)
  })
})
