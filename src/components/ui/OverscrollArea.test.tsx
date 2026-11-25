import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { OverscrollArea } from './OverscrollArea'
import { renderInScrollRoot, scrollTo, touchEnd, touchMove, touchStart } from '@/test/scrollRoot'

/** scrollTop у нижнего края при метриках по умолчанию (2000 − 600). */
const BOTTOM = 1400
/** Пауза, за которую отскок успел бы начаться, если бы он был. */
const SETTLE_WAIT_MS = 60

const renderArea = (scrollTop = 0) => {
  const view = renderInScrollRoot(<OverscrollArea>Содержимое</OverscrollArea>, { scrollTop })
  return { ...view, area: screen.getByText('Содержимое') }
}

// Смещение пишет motion на своём кадре, поэтому значение ждём.
const expectOffset = (area: HTMLElement, transform: string) =>
  waitFor(() => expect(area.style.transform).toBe(transform), { timeout: 2000 })

const expectNotMoved = (area: HTMLElement) => expect(area.style.transform).not.toMatch(/translate/)

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('OverscrollArea — тяга пальцем', () => {
  it('тянется за верхний край и возвращается на место', async () => {
    const { area } = renderArea()

    touchStart(area, 100)
    const move = touchMove(area, 248)

    // preventDefault сработал (слушатель non-passive) — нативный скролл не включится.
    expect(move.defaultPrevented).toBe(true)
    // 148px пальцем − 8px мёртвой зоны = 140px тяги → 70px по кривой сопротивления.
    await expectOffset(area, 'translateY(70px)')

    touchEnd(area)
    await expectOffset(area, 'none')
  })

  it('тянется за нижний край', async () => {
    const { area } = renderArea(BOTTOM)

    touchStart(area, 400)
    const move = touchMove(area, 252)

    expect(move.defaultPrevented).toBe(true)
    await expectOffset(area, 'translateY(-70px)')
  })

  it('не вмешивается в скролл посреди списка', () => {
    const { area } = renderArea(500)

    touchStart(area, 300)

    expect(touchMove(area, 500).defaultPrevented).toBe(false)
    expect(touchMove(area, 100).defaultPrevented).toBe(false)
    expectNotMoved(area)
  })

  it('не начинает тягу в пределах мёртвой зоны', () => {
    const { area } = renderArea()

    touchStart(area, 100)

    expect(touchMove(area, 105).defaultPrevented).toBe(false)
  })

  it('не перехватывает горизонтальный жест', () => {
    const { area } = renderArea()

    touchStart(area, 100)
    touchMove(area, 104, 40)

    expect(touchMove(area, 300, 60).defaultPrevented).toBe(false)
  })

  it('подхватывает тягу тем же касанием, когда скролл дошёл до края', async () => {
    const { area, scroll } = renderArea(200)

    touchStart(area, 100)
    expect(touchMove(area, 300).defaultPrevented).toBe(false)

    // Скролл дошёл до верха: отсчёт тяги идёт от этой точки, а не от начала касания.
    scroll.scrollTop = 0
    const move = touchMove(area, 448)

    expect(move.defaultPrevented).toBe(true)
    await expectOffset(area, 'translateY(70px)')
  })
})

describe('OverscrollArea — отскок при броске', () => {
  it('бросок в нижний край вылетает за него и возвращается', async () => {
    const { area, root, scroll } = renderArea(900)

    scrollTo(root, scroll, 1000, 1000)
    scrollTo(root, scroll, 1100, 1016)
    scrollTo(root, scroll, BOTTOM, 1032)

    await waitFor(() => expect(area.style.transform).toMatch(/^translateY\(-/))
    await expectOffset(area, 'none')
  })

  it('бросок в верхний край вылетает вниз', async () => {
    const { area, root, scroll } = renderArea(500)

    scrollTo(root, scroll, 400, 1000)
    scrollTo(root, scroll, 300, 1016)
    scrollTo(root, scroll, 0, 1032)

    await waitFor(() => expect(area.style.transform).toMatch(/^translateY\(\d/))
    await expectOffset(area, 'none')
  })

  it('не отскакивает от программного прыжка скролла', async () => {
    const { area, root, scroll } = renderArea(900)

    scrollTo(root, scroll, 0, 1000)
    await wait(SETTLE_WAIT_MS)

    expectNotMoved(area)
  })

  it('не отскакивает, пока палец на экране', async () => {
    const { area, root, scroll } = renderArea(900)

    touchStart(root, 300)
    scrollTo(root, scroll, 1000, 1000)
    scrollTo(root, scroll, 1100, 1016)
    scrollTo(root, scroll, BOTTOM, 1032)
    await wait(SETTLE_WAIT_MS)

    expectNotMoved(area)
  })
})
