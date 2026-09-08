import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCityAutocomplete } from './useCityAutocomplete'

vi.mock('@/shared/lib/hooks/useCities', () => ({
  useCities: () => ({ cities: [], isLoading: false }),
}))

describe('city autocomplete focus', () => {
  afterEach(() => vi.useRealTimers())

  it('opens on first focus and keeps the list open after quick refocus', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() =>
      useCityAutocomplete({ value: '', onChange: vi.fn(), options: ['Минск'] })
    )
    act(() => result.current.handleInputFocus())
    expect(result.current.hasSuggestions).toBe(true)
    act(() => result.current.handleInputBlur())
    act(() => result.current.handleInputFocus())
    act(() => vi.advanceTimersByTime(250))
    expect(result.current.showSuggestions).toBe(true)
    expect(result.current.isFocused).toBe(true)
  })

  it('does not validate stale text after selecting a city', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useCityAutocomplete({ value: 'x', onChange, options: ['Минск'] })
    )
    act(() => result.current.handleInputBlur())
    act(() => result.current.handleCitySelect('Минск'))
    act(() => vi.advanceTimersByTime(250))
    expect(result.current.isValid).toBe(true)
    expect(onChange).toHaveBeenCalledExactlyOnceWith('Минск')
  })

  it('cleans up pending validation on unmount', () => {
    vi.useFakeTimers()
    const { result, unmount } = renderHook(() =>
      useCityAutocomplete({ value: '', onChange: vi.fn(), options: [] })
    )
    act(() => result.current.handleInputBlur())
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
