import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PullToRefresh } from './PullToRefresh'

const scroll = vi.hoisted(() => ({ top: 0 }))

vi.mock('@/shared/ui/appScroll', () => ({ getAppScrollTop: () => scroll.top }))
vi.mock('@/shared/lib/hooks/useBodyScrollLock', () => ({ isBodyScrollLocked: () => false }))
vi.mock('@/components/ui/loader', () => ({ Loader: () => <span data-testid="loader" /> }))

// jsdom не умеет TouchEvent — собираем событие вручную с нужными полями.
const touchEvent = (type: string, clientY: number, clientX = 0) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', { value: [{ clientX, clientY }] })
  return event
}

const touchStart = (target: HTMLElement, clientY: number, clientX = 0) =>
  fireEvent.touchStart(target, { touches: [{ clientX, clientY }] })

const touchMove = (target: HTMLElement, clientY: number, clientX = 0) => {
  const event = touchEvent('touchmove', clientY, clientX)
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

// Сдвиг списка пишет motion на своём кадре, поэтому значение ждём.
const expectListOffset = (list: HTMLElement, transform: string) =>
  waitFor(() => expect(list.parentElement?.style.transform).toBe(transform))

describe('PullToRefresh', () => {
  beforeEach(() => {
    scroll.top = 0
  })

  it('при тяге вниз на верхней границе гасит нативный скролл и сдвигает лишь список', async () => {
    render(
      <PullToRefresh onRefresh={vi.fn()} staticContent={<header>Шапка</header>}>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    touchStart(list, 100)
    const move = touchMove(list, 248)

    // preventDefault сработал (слушатель non-passive) — overscroll iOS не включится.
    expect(move.defaultPrevented).toBe(true)
    // 148px пальцем − 8px мёртвой зоны = 140px тяги → 70px сдвига по кривой сопротивления.
    await expectListOffset(list, 'translateY(70px)')
    expect(screen.getByText('Шапка').style.transform).toBe('')
    expect(screen.getByTestId('loader')).toBeInTheDocument()
  })

  it('не начинает тягу в пределах мёртвой зоны', () => {
    render(
      <PullToRefresh onRefresh={vi.fn()}>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    touchStart(list, 100)
    const move = touchMove(list, 105)

    expect(move.defaultPrevented).toBe(false)
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
  })

  it('не перехватывает горизонтальный жест', () => {
    render(
      <PullToRefresh onRefresh={vi.fn()}>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    touchStart(list, 100)
    touchMove(list, 104, 40)
    const move = touchMove(list, 300, 60)

    expect(move.defaultPrevented).toBe(false)
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
  })

  it('подхватывает тягу тем же касанием, когда скролл дошёл до верха', async () => {
    render(
      <PullToRefresh onRefresh={vi.fn()}>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    scroll.top = 200
    touchStart(list, 100)
    expect(touchMove(list, 300).defaultPrevented).toBe(false)

    // Скролл дошёл до верха: отсчёт тяги идёт от этой точки, а не от начала касания.
    scroll.top = 0
    const move = touchMove(list, 448)

    expect(move.defaultPrevented).toBe(true)
    await expectListOffset(list, 'translateY(70px)')
  })

  it('возвращает список на место, если порог не пройден', async () => {
    const onRefresh = vi.fn()
    render(
      <PullToRefresh onRefresh={onRefresh} threshold={72}>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    touchStart(list, 0)
    touchMove(list, 60)
    fireEvent.touchEnd(list)

    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument())
    expect(onRefresh).not.toHaveBeenCalled()
    await expectListOffset(list, 'none')
  })

  it('вызывает onRefresh при тяге за порог и возвращает список на место', async () => {
    const onRefresh = vi.fn(async () => undefined)
    render(
      <PullToRefresh onRefresh={onRefresh} threshold={72}>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    touchStart(list, 0)
    touchMove(list, 300)
    await act(async () => {
      fireEvent.touchEnd(list)
    })

    expect(onRefresh).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument())
    await expectListOffset(list, 'none')
  })

  it('не реагирует на жест, пока disabled', () => {
    render(
      <PullToRefresh onRefresh={vi.fn()} disabled>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    touchStart(list, 0)
    const move = touchMove(list, 300)

    expect(move.defaultPrevented).toBe(false)
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
  })
})
