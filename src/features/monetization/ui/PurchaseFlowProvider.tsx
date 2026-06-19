import { memo, useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { Drawer, DrawerBody, DrawerFooter, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { Button } from '@/components/ui/button'
import { ICON_MD_CLASS } from '@/shared/constants/role-icons'
import { useToast } from '@/shared/lib/hooks/useToast'
import { openTelegramInvoice } from '@/shared/utils/telegram'
import { triggerHapticFeedback } from '@/shared/utils/haptics'
import { usePurchaseCheckoutMutation } from '@/services/api/purchasesApi'
import type { PaymentRequiredInfo } from '@/shared/lib/monetization/paymentRequired'
import { PurchaseFlowContext, type PurchaseFlowContextValue } from '../purchaseFlowContext'

/**
 * Глобальный flow разовой покупки слота (Telegram Stars). Срабатывает по 402:
 * вызывающий код делает `await requestPurchase(info)`; при `true` повторяет действие.
 */
export const PurchaseFlowProvider = memo(function PurchaseFlowProvider({
  children,
}: {
  children: ReactNode
}) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [checkout] = usePurchaseCheckoutMutation()
  const [info, setInfo] = useState<PaymentRequiredInfo | null>(null)
  const [isPaying, setIsPaying] = useState(false)
  const resolverRef = useRef<((ok: boolean) => void) | null>(null)

  // Завершает текущий запрос покупки и закрывает drawer.
  const settle = useCallback((ok: boolean) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setInfo(null)
    setIsPaying(false)
    resolve?.(ok)
  }, [])

  const requestPurchase = useCallback((next: PaymentRequiredInfo): Promise<boolean> => {
    // Если предыдущий запрос ещё висит — закрываем его как невыполненный.
    resolverRef.current?.(false)
    return new Promise<boolean>(resolve => {
      resolverRef.current = resolve
      setInfo(next)
    })
  }, [])

  const handlePay = useCallback(async () => {
    if (!info) return
    setIsPaying(true)
    try {
      const { data } = await checkout({ purchase_type: info.purchaseType }).unwrap()
      const status = await openTelegramInvoice(data.invoice_url)
      if (status === 'paid') {
        triggerHapticFeedback('success')
        settle(true)
        return
      }
      showToast(
        t(
          status === 'cancelled'
            ? 'monetization.purchase.cancelled'
            : 'monetization.purchase.processing'
        ),
        status === 'cancelled' ? 'info' : 'error'
      )
      setIsPaying(false)
    } catch {
      showToast(t('monetization.purchase.error'), 'error')
      setIsPaying(false)
    }
  }, [info, checkout, settle, showToast, t])

  const value = useMemo<PurchaseFlowContextValue>(() => ({ requestPurchase }), [requestPurchase])

  const typeLabel = info ? t(`monetization.purchase.${info.purchaseType}`) : ''

  return (
    <PurchaseFlowContext.Provider value={value}>
      {children}

      <Drawer
        open={info != null}
        onOpenChange={open => {
          if (!open) settle(false)
        }}
        preventClose={isPaying}
      >
        <DrawerFrame>
          <DrawerTitleBar title={t('monetization.purchase.title')} onClose={() => settle(false)} />

          <DrawerBody className="flex flex-col items-center gap-3 pb-4 pt-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Star className={ICON_MD_CLASS} aria-hidden="true" />
            </span>
            <p className="text-base font-semibold text-foreground">{typeLabel}</p>
            <p className="text-sm text-muted-foreground">
              {t('monetization.purchase.description')}
            </p>
          </DrawerBody>

          <DrawerFooter>
            <Button
              type="button"
              onClick={handlePay}
              variant="gradient"
              size="md"
              className="w-full"
              loading={isPaying}
              disabled={isPaying}
            >
              {t('monetization.purchase.payButton', { count: info?.price ?? 0 })}
            </Button>
          </DrawerFooter>
        </DrawerFrame>
      </Drawer>
    </PurchaseFlowContext.Provider>
  )
})
