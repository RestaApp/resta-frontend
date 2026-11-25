import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { PageOverscroll } from './PageOverscroll'
import { PullToRefresh } from './PullToRefresh'
import { renderInScrollRoot, scrollTo, touchEnd, touchMove, touchStart } from '@/test/scrollRoot'

const platform = vi.hoisted(() => ({ isIos: false }))

vi.mock('@/app/contexts/telegram/utils', () => ({ isIosDevice: () => platform.isIos }))
vi.mock('@/components/ui/loader', () => ({ Loader: () => <span data-testid="loader" /> }))

/** scrollTop у нижнего края при метриках по умолчанию (2000 − 600). */
const BOTTOM = 1400
/** Пауза, за которую отскок успел бы начаться, если бы он был. */
const SETTLE_WAIT_MS = 60

interface RenderOptions {
  scrollTop?: number
  onRefresh?: () => Promise<unknown> | void
  refreshDisabled?: boolean
}

const renderPage = ({ scrollTop = 0, onRefresh, refreshDisabled }: RenderOptions = {}) => {
  const content = <div>Содержимое</div>
  const view = renderInScrollRoot(
    <PageOverscroll>
      {onRefresh ? (
        <PullToRefresh onRefresh={onRefresh} disabled={refreshDisabled}>
          {content}
        </PullToRefresh>
      ) : (
        content
      )}
    </PageOverscroll>,
    { scrollTop }
  )
  const page = screen.getByText('Содержимое')
  // Слой, который сдвигает резинка, — обёртка страницы.
  return { ...view, page, layer: page.parentElement as HTMLElement }
}

/** Обновление, которое завершается по команде теста. */
const createPendingRefresh = () => {
  let finish: () => void = () => undefined
  const onRefresh = vi.fn(
    () =>
      new Promise<void>(resolve => {
        finish = resolve
      })
  )
  return { onRefresh, finish: () => finish() }
}

// Смещение пишет motion на своём кадре, поэтому значение ждём.
const expectOffset = (layer: HTMLElement, transform: string) =>
  waitFor(() => expect(layer.style.transform).toBe(transform), { timeout: 2000 })

const expectNotMoved = (layer: HTMLElement) =>
  expect(layer.style.transform).not.toMatch(/translate/)

const expectNoLoader = () => expect(screen.queryByTestId('loader')).not.toBeInTheDocument()

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

beforeEach(() => {
  platform.isIos = false
})

describe('PageOverscroll — имитация резинки: тяга пальцем', () => {
  it('тянется за верхний край и возвращается на место', async () => {
    const { page, layer } = renderPage()

    touchStart(page, 100)
    const move = touchMove(page, 248)

    // preventDefault сработал (слушатель non-passive) — нативный скролл не включится.
    expect(move.defaultPrevented).toBe(true)
    // 148px пальцем − 8px мёртвой зоны = 140px тяги → 70px по кривой сопротивления.
    await expectOffset(layer, 'translateY(70px)')

    touchEnd(page)
    await expectOffset(layer, 'none')
  })

  it('тянется за нижний край', async () => {
    const { page, layer } = renderPage({ scrollTop: BOTTOM })

    touchStart(page, 400)
    const move = touchMove(page, 252)

    expect(move.defaultPrevented).toBe(true)
    await expectOffset(layer, 'translateY(-70px)')
  })

  it('не вмешивается в скролл посреди списка', () => {
    const { page, layer } = renderPage({ scrollTop: 500 })

    touchStart(page, 300)

    expect(touchMove(page, 500).defaultPrevented).toBe(false)
    expect(touchMove(page, 100).defaultPrevented).toBe(false)
    expectNotMoved(layer)
  })

  it('не начинает тягу в пределах мёртвой зоны', () => {
    const { page } = renderPage()

    touchStart(page, 100)

    expect(touchMove(page, 105).defaultPrevented).toBe(false)
  })

  it('не перехватывает горизонтальный жест', () => {
    const { page } = renderPage()

    touchStart(page, 100)
    touchMove(page, 104, 40)

    expect(touchMove(page, 300, 60).defaultPrevented).toBe(false)
  })

  it('подхватывает тягу тем же касанием, когда скролл дошёл до края', async () => {
    const { page, layer, scroll } = renderPage({ scrollTop: 200 })

    touchStart(page, 100)
    expect(touchMove(page, 300).defaultPrevented).toBe(false)

    // Скролл дошёл до верха: отсчёт тяги идёт от этой точки, а не от начала касания.
    scroll.scrollTop = 0
    const move = touchMove(page, 448)

    expect(move.defaultPrevented).toBe(true)
    await expectOffset(layer, 'translateY(70px)')
  })
})

describe('PageOverscroll — имитация резинки: отскок при броске', () => {
  it('бросок в нижний край вылетает за него и возвращается', async () => {
    const { layer, root, scroll } = renderPage({ scrollTop: 900 })

    scrollTo(root, scroll, 1000, 1000)
    scrollTo(root, scroll, 1100, 1016)
    scrollTo(root, scroll, BOTTOM, 1032)

    await waitFor(() => expect(layer.style.transform).toMatch(/^translateY\(-/))
    await expectOffset(layer, 'none')
  })

  it('бросок в верхний край вылетает вниз', async () => {
    const { layer, root, scroll } = renderPage({ scrollTop: 500 })

    scrollTo(root, scroll, 400, 1000)
    scrollTo(root, scroll, 300, 1016)
    scrollTo(root, scroll, 0, 1032)

    await waitFor(() => expect(layer.style.transform).toMatch(/^translateY\(\d/))
    await expectOffset(layer, 'none')
  })

  it('стартует на подлёте к краю, не дожидаясь остановки скролла', async () => {
    const { layer, root, scroll } = renderPage({ scrollTop: 900 })

    scrollTo(root, scroll, 1000, 1000)
    // 300px за 16мс: до края 100px — меньше кадра полёта.
    scrollTo(root, scroll, 1300, 1016)

    await waitFor(() => expect(layer.style.transform).toMatch(/^translateY\(-/))
  })

  it('не отскакивает от программного прыжка скролла', async () => {
    const { layer, root, scroll } = renderPage({ scrollTop: 900 })

    scrollTo(root, scroll, 0, 1000)
    await wait(SETTLE_WAIT_MS)

    expectNotMoved(layer)
  })

  it('не отскакивает, пока палец на экране', async () => {
    const { layer, root, scroll } = renderPage({ scrollTop: 900 })

    touchStart(root, 300)
    scrollTo(root, scroll, 1000, 1000)
    scrollTo(root, scroll, 1100, 1016)
    scrollTo(root, scroll, BOTTOM, 1032)
    await wait(SETTLE_WAIT_MS)

    expectNotMoved(layer)
  })
})

describe('PageOverscroll — обновление по тяге', () => {
  it('отпущенная за порогом страница держится со спиннером до конца onRefresh', async () => {
    const { onRefresh, finish } = createPendingRefresh()
    const { page, layer } = renderPage({ onRefresh })

    touchStart(page, 0)
    touchMove(page, 300)
    expect(screen.getByTestId('loader')).toBeInTheDocument()

    touchEnd(page)

    expect(onRefresh).toHaveBeenCalledTimes(1)
    await expectOffset(layer, 'translateY(72px)')
    expect(screen.getByTestId('loader')).toBeInTheDocument()

    await act(async () => finish())
    await expectOffset(layer, 'none')
    expectNoLoader()
  })

  it('не обновляет, если порог не пройден', async () => {
    const onRefresh = vi.fn()
    const { page, layer } = renderPage({ onRefresh })

    touchStart(page, 0)
    touchMove(page, 60)
    touchEnd(page)

    await expectOffset(layer, 'none')
    expect(onRefresh).not.toHaveBeenCalled()
    expectNoLoader()
  })

  it('не обновляет и не показывает спиннер, если касание началось не в самом верху', async () => {
    const onRefresh = vi.fn()
    const { page, layer, scroll } = renderPage({ onRefresh, scrollTop: 200 })

    touchStart(page, 0)
    scroll.scrollTop = 0
    touchMove(page, 10)
    touchMove(page, 400)

    await waitFor(() => expect(layer.style.transform).toMatch(/^translateY\(\d/))
    expectNoLoader()

    touchEnd(page)
    await expectOffset(layer, 'none')
    expect(onRefresh).not.toHaveBeenCalled()
  })

  it('не показывает спиннер при отскоке от броска', async () => {
    const { layer, root, scroll } = renderPage({ onRefresh: vi.fn(), scrollTop: 500 })

    scrollTo(root, scroll, 400, 1000)
    scrollTo(root, scroll, 300, 1016)
    scrollTo(root, scroll, 0, 1032)

    await waitFor(() => expect(layer.style.transform).toMatch(/^translateY\(\d/))
    expectNoLoader()
  })

  it('пока обновление недоступно — пружинит без спиннера и запроса', async () => {
    const onRefresh = vi.fn()
    const { page, layer } = renderPage({ onRefresh, refreshDisabled: true })

    touchStart(page, 0)
    touchMove(page, 300)

    await waitFor(() => expect(layer.style.transform).toMatch(/^translateY\(\d/))
    expectNoLoader()

    touchEnd(page)
    await expectOffset(layer, 'none')
    expect(onRefresh).not.toHaveBeenCalled()
  })
})

describe('PageOverscroll — нативная резинка iOS', () => {
  beforeEach(() => {
    platform.isIos = true
  })

  it('не перехватывает жест: страницу двигает система', () => {
    const { page, layer } = renderPage()

    touchStart(page, 100)

    expect(touchMove(page, 300).defaultPrevented).toBe(false)
    expectNotMoved(layer)
  })

  it('обновляет, когда система оттянула страницу за порог', async () => {
    const { onRefresh, finish } = createPendingRefresh()
    const { page, layer, scroll } = renderPage({ onRefresh })

    touchStart(page, 0)
    expect(screen.getByTestId('loader')).toBeInTheDocument()

    // Нативная резинка уводит scrollTop в минус.
    scroll.scrollTop = -90
    touchEnd(page)

    expect(onRefresh).toHaveBeenCalledTimes(1)
    await expectOffset(layer, 'translateY(72px)')

    scroll.scrollTop = 0
    await act(async () => finish())
    await expectOffset(layer, 'none')
    expectNoLoader()
  })

  it('не обновляет, если оттянуто меньше порога', () => {
    const onRefresh = vi.fn()
    const { page, scroll } = renderPage({ onRefresh })

    touchStart(page, 0)
    scroll.scrollTop = -40
    touchEnd(page)

    expect(onRefresh).not.toHaveBeenCalled()
  })

  it('не обновляет, если касание началось не в самом верху', () => {
    const onRefresh = vi.fn()
    const { page, scroll } = renderPage({ onRefresh, scrollTop: 200 })

    touchStart(page, 0)
    scroll.scrollTop = -90
    touchEnd(page)

    expect(onRefresh).not.toHaveBeenCalled()
    expectNoLoader()
  })
})

describe('PullToRefresh', () => {
  it('вне PageOverscroll просто отдаёт содержимое', () => {
    renderInScrollRoot(
      <PullToRefresh onRefresh={vi.fn()}>
        <div>Список</div>
      </PullToRefresh>
    )

    expect(screen.getByText('Список')).toBeInTheDocument()
  })
})
