import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAnchoredDropdownRect } from './useAnchoredDropdownRect'

/** Якорь высотой 48px с верхней границей на `top`. */
const anchorAt = (top: number) => {
  const el = document.createElement('div')
  el.getBoundingClientRect = () =>
    ({ top, bottom: top + 48, left: 16, width: 300, right: 316, height: 48 }) as DOMRect
  return { current: el }
}

/** Видимая часть окна: клавиатура сужает её, не меняя window.innerHeight. */
const setVisibleHeight = (height: number) => {
  vi.stubGlobal('visualViewport', {
    offsetTop: 0,
    height,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
}

describe('useAnchoredDropdownRect', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('открывает список вниз, когда под якорем хватает места', () => {
    setVisibleHeight(800)

    const anchor = anchorAt(100)
    const { result } = renderHook(() => useAnchoredDropdownRect(true, anchor))

    expect(result.current).toEqual({
      placement: 'below',
      top: 152,
      left: 16,
      width: 300,
      maxHeight: 215,
    })
  })

  it('открывает вверх, когда клавиатура съела место под якорем', () => {
    // Якорь на 400–448px, видимая часть окна — 500px: под якорем остаётся 32px.
    setVisibleHeight(500)

    const anchor = anchorAt(400)
    const { result } = renderHook(() => useAnchoredDropdownRect(true, anchor))

    expect(result.current).toMatchObject({ placement: 'above', top: 396, maxHeight: 215 })
  })

  it('остаётся внизу, если сверху места ещё меньше', () => {
    setVisibleHeight(200)

    const anchor = anchorAt(40)
    const { result } = renderHook(() => useAnchoredDropdownRect(true, anchor))

    // Под якорем 92px, над ним 20px: вниз, с высотой по доступному месту.
    expect(result.current).toMatchObject({ placement: 'below', maxHeight: 92 })
  })

  it('ничего не возвращает, пока список закрыт', () => {
    const anchor = anchorAt(100)
    const { result } = renderHook(() => useAnchoredDropdownRect(false, anchor))

    expect(result.current).toBeNull()
  })
})
