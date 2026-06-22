import { describe, expect, it } from 'vitest'
import { buildQueryParams } from './helpers'

describe('buildQueryParams', () => {
  it('кодирует спецсимволы и пропускает nullish значения', () => {
    expect(
      buildQueryParams({
        position: 'sous chef',
        city: 'Минск',
        empty: undefined,
        nullable: null,
      })
    ).toBe('position=sous+chef&city=%D0%9C%D0%B8%D0%BD%D1%81%D0%BA')
  })

  it('поддерживает arrays в brackets-формате по умолчанию', () => {
    expect(
      buildQueryParams({
        specializations: ['hot', 'cold'],
      })
    ).toBe('specializations%5B%5D=hot&specializations%5B%5D=cold')
  })

  it('сериализует числовой per_page (полные списки applied/received)', () => {
    expect(buildQueryParams({ per_page: 100 })).toBe('per_page=100')
  })

  it('пустой объект даёт пустую строку (вызов без параметров не добавляет ?)', () => {
    expect(buildQueryParams({})).toBe('')
  })

  it('поддерживает repeat-формат и Date', () => {
    expect(
      buildQueryParams(
        {
          day: new Date('2026-06-14T10:20:30.000Z'),
          tags: ['urgent', 'boosted'],
        },
        { arrayFormat: 'repeat' }
      )
    ).toBe('day=2026-06-14T10%3A20%3A30.000Z&tags=urgent&tags=boosted')
  })
})
