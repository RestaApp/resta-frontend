import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useLazyGetCurrentSubscriptionQuery,
  useSubscriptionCheckoutMutation,
} from '@/services/api/subscriptionsApi'
import { useToast } from '@/shared/lib/hooks/useToast'
import { openTelegramInvoice } from '@/shared/utils/telegram'
import { triggerHapticFeedback } from '@/shared/utils/haptics'
import { waitWithBackoff } from '@/shared/lib/monetization/waitWithBackoff'

const ACTIVE_STATUSES = new Set(['active', 'trial', 'renewed'])

/**
 * Flow покупки подписки: checkout → openInvoice → при 'paid' поллинг
 * `subscriptions/current` с backoff до появления активной подписки
 * (webhook Telegram может прийти с задержкой).
 */
export const useSubscriptionCheckout = () => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [checkout] = useSubscriptionCheckoutMutation()
  const [fetchCurrent] = useLazyGetCurrentSubscriptionQuery()
  const [isProcessing, setIsProcessing] = useState(false)

  const upgrade = useCallback(
    async (planName: string): Promise<boolean> => {
      setIsProcessing(true)
      try {
        const { data } = await checkout({ plan_name: planName }).unwrap()
        const status = await openTelegramInvoice(data.invoice_url)
        if (status !== 'paid') {
          if (status === 'cancelled') showToast(t('monetization.pro.cancelled'), 'info')
          else showToast(t('monetization.pro.processing'), 'error')
          return false
        }

        triggerHapticFeedback('success')
        const active = await waitWithBackoff(async () => {
          const current = await fetchCurrent().unwrap()
          const sub = current.data.subscription
          return sub && ACTIVE_STATUSES.has(sub.status) ? sub : null
        })

        if (active) {
          showToast(t('monetization.pro.success'), 'success')
          return true
        }
        showToast(t('monetization.pro.processing'), 'info')
        return false
      } catch (error: unknown) {
        // 422 monetization_disabled — флаг поставщиков на бэке ещё выключен
        // (страховка при рассинхроне фронт/бэк флагов). Не вводим в заблуждение
        // сообщением об обработке оплаты — checkout заблокирован.
        const status = (error as { status?: unknown })?.status
        showToast(
          t(status === 422 ? 'monetization.pro.disabled' : 'monetization.pro.processing'),
          status === 422 ? 'info' : 'error'
        )
        return false
      } finally {
        setIsProcessing(false)
      }
    },
    [checkout, fetchCurrent, showToast, t]
  )

  return { upgrade, isProcessing }
}
