import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { PullToRefresh } from './PullToRefresh'

vi.mock('@/shared/ui/appScroll', () => ({ getAppScrollTop: () => 0 }))
vi.mock('@/shared/lib/hooks/useBodyScrollLock', () => ({ isBodyScrollLocked: () => false }))
vi.mock('@/components/ui/loader', () => ({ Loader: () => <span data-testid="loader" /> }))

// jsdom не умеет TouchEvent — собираем событие вручную с нужными полями.
const touchEvent = (type: string, clientY: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', { value: [{ clientY }] })
  return event
}

describe('PullToRefresh', () => {
  it('при тяге вниз на верхней границе гасит нативный скролл и сдвигает только список', () => {
    render(
      <PullToRefresh onRefresh={vi.fn()} staticContent={<header>Шапка</header>}>
        <div>Список</div>
      </PullToRefresh>
    )

    const list = screen.getByText('Список')
    const container = screen.getByText('Шапка').parentElement as HTMLElement

    fireEvent.touchStart(list, { touches: [{ clientY: 100 }] })
    const move = touchEvent('touchmove', 260)
    act(() => {
      list.dispatchEvent(move)
    })

    // preventDefault сработал (слушатель non-passive) — overscroll iOS не включится.
    expect(move.defaultPrevented).toBe(true)
    // 160px тяги × сопротивление 0.45 = 72px сдвига списка; шапка без transform.
    expect(list.parentElement?.style.transform).toBe('translate3d(0, 72px, 0)')
    expect(screen.getByText('Шапка').style.transform).toBe('')
    expect(container).toBeInTheDocument()
  })

  it('вызывает onRefresh при тяге за порог и возвращает список на место', async () => {
    const onRefresh = vi.fn(async () => undefined)
    render(
      <PullToRefresh onRefresh={onRefresh} threshold={72}>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    fireEvent.touchStart(list, { touches: [{ clientY: 0 }] })
    act(() => {
      list.dispatchEvent(touchEvent('touchmove', 300))
    })
    await act(async () => {
      fireEvent.touchEnd(list)
    })

    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(list.parentElement?.style.transform).toBe('')
  })
})
