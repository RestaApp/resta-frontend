/**
 * Тестовые помощники для кода, завязанного на единый scroll-root приложения
 * (`data-app-scroll-root`) и touch-жесты. jsdom не считает layout и не умеет
 * TouchEvent, поэтому метрики скролла и события собираются вручную.
 */
import type { ReactElement } from 'react'
import { act, render } from '@testing-library/react'

interface ScrollMetrics {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

const SCROLL_METRIC_KEYS = ['scrollTop', 'scrollHeight', 'clientHeight'] as const

/** Рендерит `ui` внутри scroll-root; `scroll` можно менять по ходу теста. */
export const renderInScrollRoot = (ui: ReactElement, metrics: Partial<ScrollMetrics> = {}) => {
  const scroll: ScrollMetrics = { scrollTop: 0, scrollHeight: 2000, clientHeight: 600, ...metrics }
  const result = render(<div data-app-scroll-root>{ui}</div>)
  const root = result.container.firstElementChild as HTMLElement

  for (const key of SCROLL_METRIC_KEYS) {
    Object.defineProperty(root, key, { configurable: true, get: () => scroll[key] })
  }

  return { ...result, root, scroll }
}

const dispatch = (target: HTMLElement, event: Event) => {
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

const touchEvent = (type: string, points: Array<{ clientX: number; clientY: number }>) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', { value: points })
  return event
}

export const touchStart = (target: HTMLElement, clientY: number, clientX = 0) =>
  dispatch(target, touchEvent('touchstart', [{ clientX, clientY }]))

export const touchMove = (target: HTMLElement, clientY: number, clientX = 0) =>
  dispatch(target, touchEvent('touchmove', [{ clientX, clientY }]))

export const touchEnd = (target: HTMLElement) => dispatch(target, touchEvent('touchend', []))

/** Событие скролла с заданным временем — по нему считается скорость броска. */
export const scrollTo = (
  root: HTMLElement,
  scroll: ScrollMetrics,
  scrollTop: number,
  timeStamp: number
) => {
  scroll.scrollTop = scrollTop
  const event = new Event('scroll')
  Object.defineProperty(event, 'timeStamp', { value: timeStamp })
  return dispatch(root, event)
}
