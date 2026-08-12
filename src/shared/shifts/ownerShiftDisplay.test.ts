import { describe, expect, it } from 'vitest'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { isEditableOwnerListing } from './ownerShiftDisplay'

const vacancy = (overrides: Partial<VacancyApiItem> = {}): VacancyApiItem =>
  ({
    id: 1,
    title: 'Повар',
    status: 'open',
    shift_type: 'vacancy',
    ...overrides,
  }) as VacancyApiItem

describe('isEditableOwnerListing', () => {
  it.each(['filled', 'completed', 'cancelled', 'canceled', 'closed'])(
    'запрещает редактирование для статуса %s',
    status => {
      expect(isEditableOwnerListing(vacancy({ status }))).toBe(false)
    }
  )

  it('запрещает редактирование, если кандидат уже выбран', () => {
    expect(
      isEditableOwnerListing(
        vacancy({
          selected_applicant: {
            user_id: 2,
            full_name: 'Иван Петров',
          },
        })
      )
    ).toBe(false)
  })

  it.each(['open', undefined])('разрешает редактирование активной публикации', status => {
    expect(isEditableOwnerListing(vacancy({ status }))).toBe(true)
  })

  it('разрешает редактирование срочной активной публикации', () => {
    expect(isEditableOwnerListing(vacancy({ urgent: true }))).toBe(true)
  })
})
