import { describe, it, expect } from 'vitest'
import type { AdvancedFiltersData } from '@/shared/shifts/types'
import { buildVacanciesBaseParams, buildVacanciesQueryParams } from './queryParams'

const adv = (over: Partial<AdvancedFiltersData>): AdvancedFiltersData => over as AdvancedFiltersData

describe('buildVacanciesBaseParams', () => {
  it('пустой advanced → {}', () => {
    expect(buildVacanciesBaseParams({ advanced: null })).toEqual({})
  })

  it('город триммится, специализации join, диапазон ставки', () => {
    const params = buildVacanciesBaseParams({
      advanced: adv({
        selectedCity: '  Минск ',
        selectedSpecializations: ['sous_chef', 'grill_cook'],
        selectedSalaryRange: '80-120',
      }),
      shiftType: 'vacancy',
    })
    expect(params.city).toBe('Минск')
    expect(params.specialization).toBe('sous_chef,grill_cook')
    expect(params.min_payment).toBe(80)
    expect(params.max_payment).toBe(120)
  })

  it('дата-фильтр применяется только для replacement', () => {
    const f = adv({ selectedDatePreset: 'today' })
    expect(
      buildVacanciesBaseParams({ advanced: f, shiftType: 'vacancy' }).start_date
    ).toBeUndefined()
    expect(
      buildVacanciesBaseParams({ advanced: f, shiftType: 'replacement' }).start_date
    ).toBeDefined()
  })
})

describe('buildVacanciesQueryParams', () => {
  it('прокидывает shift_type/page/per_page', () => {
    const p = buildVacanciesQueryParams({ shiftType: 'vacancy', page: 2, perPage: 20 })
    expect(p).toMatchObject({ shift_type: 'vacancy', page: 2, per_page: 20 })
    expect(p.urgent).toBeUndefined()
  })

  it('urgent=true ставится только при true', () => {
    expect(
      buildVacanciesQueryParams({ shiftType: 'replacement', page: 1, perPage: 5, urgent: true })
        .urgent
    ).toBe(true)
    expect(
      buildVacanciesQueryParams({ shiftType: 'replacement', page: 1, perPage: 5, urgent: false })
        .urgent
    ).toBeUndefined()
  })
})
