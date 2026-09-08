import { describe, expect, it } from 'vitest'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { canModerateListing, canModerateListingStatus } from './applicationModeration'

describe('application moderation', () => {
  it.each(['completed', 'cancelled', 'closed', 'unknown', undefined])(
    'hides moderation for %s listings',
    status => expect(canModerateListingStatus(status)).toBe(false)
  )

  it.each(['open', 'filled'])('allows moderation on active %s listings', status => {
    expect(canModerateListing({ status } as VacancyApiItem)).toBe(true)
  })

  it.each(['open', 'filled'])('blocks expired %s listings before the server job runs', status => {
    expect(canModerateListing({ status, end_time: '2000-01-01T00:00:00Z' } as VacancyApiItem)).toBe(
      false
    )
  })

  it('does not enable actions before the listing is loaded', () => {
    expect(canModerateListing(null)).toBe(false)
  })
})
