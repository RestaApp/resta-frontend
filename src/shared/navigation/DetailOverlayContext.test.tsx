import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DetailOverlayProvider } from './DetailOverlayContext'
import { useDetailOverlay } from './overlayContextHooks'

const wrapper = ({ children }: { children: ReactNode }) => (
  <DetailOverlayProvider>{children}</DetailOverlayProvider>
)

describe('DetailOverlayProvider', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    vi.restoreAllMocks()
  })

  it('не добавляет одинаковую вакансию в history повторно', () => {
    const pushState = vi.spyOn(window.history, 'pushState')
    const { result } = renderHook(() => useDetailOverlay(), { wrapper })

    act(() => {
      result.current.openVacancyDetail(42)
      result.current.openVacancyDetail(42)
      result.current.openVacancyDetail(42)
    })

    expect(pushState).toHaveBeenCalledTimes(1)
    expect(window.location.pathname).toBe('/vacancy/42')
  })

  it('добавляет новый маршрут при переходе к другой вакансии', () => {
    const pushState = vi.spyOn(window.history, 'pushState')
    const { result } = renderHook(() => useDetailOverlay(), { wrapper })

    act(() => {
      result.current.openVacancyDetail(42)
      result.current.openVacancyDetail(43)
    })

    expect(pushState).toHaveBeenCalledTimes(2)
    expect(window.location.pathname).toBe('/vacancy/43')
  })
})
