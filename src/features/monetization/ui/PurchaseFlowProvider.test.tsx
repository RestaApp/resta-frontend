import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useEffect, type ReactNode } from 'react'
import { PurchaseFlowProvider } from './PurchaseFlowProvider'
import { usePurchaseFlow } from '@/shared/lib/monetization/purchaseFlowContext'
import type { PaymentRequiredInfo } from '@/shared/lib/monetization/paymentRequired'

// vi.mock хойстится выше импортов — спаи создаём через vi.hoisted.
const mocks = vi.hoisted(() => ({
  showToast: vi.fn(),
  triggerHapticFeedback: vi.fn(),
  checkout: vi.fn(),
  openTelegramInvoice: vi.fn(),
}))

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('@/shared/lib/hooks/useToast', () => ({ useToast: () => ({ showToast: mocks.showToast }) }))
vi.mock('@/shared/utils/haptics', () => ({ triggerHapticFeedback: mocks.triggerHapticFeedback }))
vi.mock('@/shared/utils/telegram', () => ({ openTelegramInvoice: mocks.openTelegramInvoice }))
vi.mock('@/services/api/purchasesApi', () => ({
  usePurchaseCheckoutMutation: () => [mocks.checkout],
}))

// Лёгкие заглушки UI: drawer рендерит контент только когда открыт.
vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? <div data-testid="drawer">{children}</div> : null,
  DrawerBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DrawerFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DrawerFrame: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/ui/drawer-title-bar', () => ({
  DrawerTitleBar: ({ onClose }: { onClose: () => void }) => (
    <button data-testid="drawer-close" onClick={onClose}>
      close
    </button>
  ),
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button data-testid="pay" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

const INFO: PaymentRequiredInfo = {
  purchaseType: 'vacancy_slot',
  price: 50,
  upgradeAvailable: true,
}

// Захватываем requestPurchase из контекста провайдера (в эффекте, не в render).
const flow: { requestPurchase: (info: PaymentRequiredInfo) => Promise<boolean> } = {
  requestPurchase: () => Promise.resolve(false),
}
function Capture() {
  const ctx = usePurchaseFlow()
  useEffect(() => {
    flow.requestPurchase = ctx.requestPurchase
  }, [ctx.requestPurchase])
  return null
}

const renderProvider = () =>
  render(
    <PurchaseFlowProvider>
      <Capture />
    </PurchaseFlowProvider>
  )

beforeEach(() => {
  vi.clearAllMocks()
  mocks.openTelegramInvoice.mockResolvedValue('paid')
  mocks.checkout.mockImplementation(() => ({
    unwrap: () => Promise.resolve({ data: { invoice_url: 'tg://invoice' } }),
  }))
})

describe('PurchaseFlowProvider', () => {
  it('открывает drawer и резолвит true при успешной оплате', async () => {
    renderProvider()

    let result!: Promise<boolean>
    act(() => {
      result = flow.requestPurchase(INFO)
    })

    expect(screen.getByTestId('drawer')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByTestId('pay'))
      await result
    })

    await expect(result).resolves.toBe(true)
    expect(mocks.checkout).toHaveBeenCalledWith({ purchase_type: 'vacancy_slot' })
    expect(mocks.triggerHapticFeedback).toHaveBeenCalledWith('success')
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument()
  })

  it('резолвит false при закрытии drawer', async () => {
    renderProvider()

    let result!: Promise<boolean>
    act(() => {
      result = flow.requestPurchase(INFO)
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('drawer-close'))
      await result
    })

    await expect(result).resolves.toBe(false)
    expect(mocks.checkout).not.toHaveBeenCalled()
  })

  it('single-flight: новый запрос резолвит предыдущий как false', async () => {
    renderProvider()

    let first!: Promise<boolean>
    act(() => {
      first = flow.requestPurchase(INFO)
    })

    let second!: Promise<boolean>
    act(() => {
      second = flow.requestPurchase({
        purchaseType: 'urgent_boost',
        price: 100,
        upgradeAvailable: true,
      })
    })

    await expect(first).resolves.toBe(false)
    expect(second).toBeInstanceOf(Promise)
  })

  it('при отмене инвойса показывает тост и оставляет drawer открытым', async () => {
    renderProvider()
    mocks.openTelegramInvoice.mockResolvedValue('cancelled')

    let result!: Promise<boolean>
    act(() => {
      result = flow.requestPurchase(INFO)
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('pay'))
      await Promise.resolve()
    })

    expect(mocks.showToast).toHaveBeenCalledWith('monetization.purchase.cancelled', 'info')
    expect(screen.getByTestId('drawer')).toBeInTheDocument()
    void result
  })

  it('при ошибке checkout показывает тост ошибки и не вызывает инвойс', async () => {
    renderProvider()
    mocks.checkout.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('boom')),
    }))

    let result!: Promise<boolean>
    act(() => {
      result = flow.requestPurchase(INFO)
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('pay'))
      await Promise.resolve()
    })

    expect(mocks.showToast).toHaveBeenCalledWith('monetization.purchase.error', 'error')
    expect(mocks.openTelegramInvoice).not.toHaveBeenCalled()
    expect(screen.getByTestId('drawer')).toBeInTheDocument()
    void result
  })
})
