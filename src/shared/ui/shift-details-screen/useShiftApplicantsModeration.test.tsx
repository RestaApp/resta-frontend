import { act, renderHook } from '@testing-library/react'
import type { TFunction } from 'i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useShiftApplicantsModeration } from './useShiftApplicantsModeration'

const { accept, reject } = vi.hoisted(() => ({ accept: vi.fn(), reject: vi.fn() }))
vi.mock('@/services/api/shiftsApi', () => ({
  useAcceptApplicationMutation: () => [accept],
  useRejectApplicationMutation: () => [reject],
}))
vi.mock('@/shared/lib/hooks/useToast', () => ({ useToast: () => ({ showToast: vi.fn() }) }))
const t = ((key: string) => key) as TFunction

const listing = (status: string, applicationStatus: string): VacancyApiItem =>
  ({
    id: 1,
    status,
    applications_preview: [{ id: 7, status: applicationStatus }],
  }) as VacancyApiItem

describe('applicant moderation controls', () => {
  beforeEach(() => {
    accept.mockReset().mockReturnValue({ unwrap: () => Promise.resolve({}) })
    reject.mockReset().mockReturnValue({ unwrap: () => Promise.resolve({}) })
  })

  it.each(['completed', 'cancelled'])(
    'blocks UI and mutation callbacks for %s listings',
    async status => {
      const { result } = renderHook(() =>
        useShiftApplicantsModeration({ vacancyData: listing(status, 'accepted'), t })
      )
      act(() => result.current.setSelectedApplicantApplicationId(7))
      expect(result.current.canModerateSelected).toBe(false)
      expect(result.current.canAccept).toBe(false)
      await act(async () => {
        await result.current.handleAcceptApplication(7)
        await result.current.handleRejectApplication(7)
      })
      expect(accept).not.toHaveBeenCalled()
      expect(reject).not.toHaveBeenCalled()
    }
  )

  it('keeps rejection of an accepted candidate available on a filled listing', async () => {
    const { result } = renderHook(() =>
      useShiftApplicantsModeration({ vacancyData: listing('filled', 'accepted'), t })
    )
    act(() => result.current.setSelectedApplicantApplicationId(7))
    expect(result.current.canModerateSelected).toBe(true)
    expect(result.current.canAccept).toBe(false)
    await act(() => result.current.handleRejectApplication(7))
    expect(reject).toHaveBeenCalledOnce()
    expect(result.current.canModerateSelected).toBe(false)
  })

  it('allows acceptance of pending applications on an open listing', async () => {
    const { result } = renderHook(() =>
      useShiftApplicantsModeration({ vacancyData: listing('open', 'pending'), t })
    )
    act(() => result.current.setSelectedApplicantApplicationId(7))
    expect(result.current.canModerateSelected).toBe(true)
    await act(() => result.current.handleAcceptApplication(7))
    expect(accept).toHaveBeenCalledOnce()
  })
})
