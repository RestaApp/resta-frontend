import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ChevronRight, Sparkles } from 'lucide-react'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_INTERACTIVE_CLASS,
  SHIFT_CARD_LOGO_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import { MONETIZATION_ENABLED } from '@/shared/config/monetization'
import { useSupplierSubscription } from '../model/useSupplierSubscription'
import { UpgradeProDrawer } from './UpgradeProDrawer'

/**
 * Карточка подписки на профиле поставщика.
 *  • активная PRO → статус + бейдж + дни до истечения;
 *  • free + флаг ON → CTA «Перейти на PRO»;
 *  • free + флаг OFF → ничего (спящий режим монетизации).
 */
export const SubscriptionCard = memo(function SubscriptionCard() {
  const { t } = useTranslation()
  const { isSupplier, isPro, subscription, isLoading } = useSupplierSubscription()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (!isSupplier || isLoading) return null

  if (isPro) {
    const daysRemaining = subscription?.days_remaining ?? null
    return (
      <div className={cn(SHIFT_CARD_CLASS, 'flex items-center gap-3')}>
        <span className={cn(SHIFT_CARD_LOGO_CLASS, 'bg-primary/15 text-primary')}>
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
            {t('monetization.pro.currentPlanPro')}
          </span>
          {daysRemaining != null ? (
            <span className="text-xs text-muted-foreground">
              {t('monetization.pro.daysRemaining', { count: daysRemaining })}
            </span>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
          {t('monetization.pro.badge')}
        </span>
      </div>
    )
  }

  if (!MONETIZATION_ENABLED) return null

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setDrawerOpen(true)}
        data-haptic="light"
        className={cn(
          SHIFT_CARD_CLASS,
          SHIFT_CARD_INTERACTIVE_CLASS,
          'flex w-full items-center gap-3 text-left'
        )}
      >
        <span className={cn(SHIFT_CARD_LOGO_CLASS, 'bg-primary/15 text-primary')}>
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>
            {t('monetization.pro.upgradeTitle')}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {t('monetization.pro.upgradeSubtitle')}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </motion.button>

      <UpgradeProDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
})
