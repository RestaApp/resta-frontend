import { describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { PullToRefresh } from './PullToRefresh'
import { renderInScrollRoot, touchEnd, touchMove, touchStart } from '@/test/scrollRoot'

vi.mock('@/components/ui/loader', () => ({ Loader: () => <span data-testid="loader" /> }))

// Сдвиг списка пишет motion на своём кадре, поэтому значение ждём.
const expectListOffset = (list: HTMLElement, transform: string) =>
  waitFor(() => expect(list.parentElement?.style.transform).toBe(transform), { timeout: 2000 })

const expectNoLoader = () =>
  waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument())

// Сама резинка (края, мёртвая зона, бросок) покрыта в OverscrollArea.test.tsx;
// здесь — только то, что добавляет обновление.
describe('PullToRefresh', () => {
  it('при тяге вниз сдвигает только список и показывает спиннер', async () => {
    renderInScrollRoot(
      <PullToRefresh onRefresh={vi.fn()} staticContent={<header>Шапка</header>}>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    touchStart(list, 100)
    touchMove(list, 248)

    await expectListOffset(list, 'translateY(70px)')
    expect(screen.getByText('Шапка').style.transform).toBe('')
    expect(await screen.findByTestId('loader')).toBeInTheDocument()
  })

  it('отпущенный за порогом держит список со спиннером до конца onRefresh', async () => {
    let finishRefresh: () => void = () => undefined
    const onRefresh = vi.fn(
      () =>
        new Promise<void>(resolve => {
          finishRefresh = resolve
        })
    )
    renderInScrollRoot(
      <PullToRefresh onRefresh={onRefresh} threshold={72}>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    touchStart(list, 0)
    touchMove(list, 300)
    touchEnd(list)

    expect(onRefresh).toHaveBeenCalledTimes(1)
    await expectListOffset(list, 'translateY(72px)')
    expect(screen.getByTestId('loader')).toBeInTheDocument()

    await act(async () => {
      finishRefresh()
    })
    await expectListOffset(list, 'none')
    await expectNoLoader()
  })

  it('возвращает список на место без обновления, если порог не пройден', async () => {
    const onRefresh = vi.fn()
    renderInScrollRoot(
      <PullToRefresh onRefresh={onRefresh} threshold={72}>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    touchStart(list, 0)
    touchMove(list, 60)
    touchEnd(list)

    await expectListOffset(list, 'none')
    await expectNoLoader()
    expect(onRefresh).not.toHaveBeenCalled()
  })

  it('пока disabled — пружинит, но не показывает спиннер и не обновляет', async () => {
    const onRefresh = vi.fn()
    renderInScrollRoot(
      <PullToRefresh onRefresh={onRefresh} disabled>
        <div>Список</div>
      </PullToRefresh>
    )
    const list = screen.getByText('Список')

    touchStart(list, 0)
    touchMove(list, 300)

    await waitFor(() => expect(list.parentElement?.style.transform).toMatch(/^translateY\(\d/))
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument()

    touchEnd(list)
    await expectListOffset(list, 'none')
    expect(onRefresh).not.toHaveBeenCalled()
  })
})
