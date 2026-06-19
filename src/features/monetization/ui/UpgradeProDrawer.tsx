import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, BadgeCheck, Bell, FileText, Sparkles, Check } from 'lucide-react'
import { Drawer, DrawerBody, DrawerFooter, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { Button } from '@/components/ui/button'
import { ICON_MD_CLASS } from '@/shared/constants/role-icons'
import { SUPPLIER_PRO_PLAN } from '@/shared/config/monetization'
import { useSubscriptionCheckout } from '../model/useSubscriptionCheckout'

interface UpgradeProDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PRO_FEATURES = [
  { key: 'analytics', Icon: BarChart3 },
  { key: 'badge', Icon: BadgeCheck },
  { key: 'priority', Icon: Sparkles },
  { key: 'price_list', Icon: FileText },
  { key: 'new_restaurant_notifications', Icon: Bell },
] as const

export const UpgradeProDrawer = memo(function UpgradeProDrawer({
  open,
  onOpenChange,
}: UpgradeProDrawerProps) {
  const { t } = useTranslation()
  const { upgrade, isProcessing } = useSubscriptionCheckout()

  const handlePay = async () => {
    const ok = await upgrade(SUPPLIER_PRO_PLAN.planName)
    if (ok) onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} preventClose={isProcessing}>
      <DrawerFrame>
        <DrawerTitleBar
          title={t('monetization.pro.drawerTitle')}
          onClose={() => onOpenChange(false)}
        />

        <DrawerBody className="flex flex-col gap-4 pb-4 pt-2">
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className={ICON_MD_CLASS} aria-hidden="true" />
            </span>
            <p className="text-base font-semibold text-foreground">
              {t('monetization.pro.upgradeTitle')}
            </p>
            <p className="text-sm text-muted-foreground">{t('monetization.pro.upgradeSubtitle')}</p>
          </div>

          <ul className="flex flex-col gap-2">
            {PRO_FEATURES.map(({ key, Icon }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                  {t(`monetization.pro.features.${key}`)}
                </span>
                <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </DrawerBody>

        <DrawerFooter>
          <Button
            type="button"
            onClick={handlePay}
            variant="gradient"
            size="md"
            className="w-full"
            loading={isProcessing}
            disabled={isProcessing}
          >
            {`${t('monetization.pro.payButton')} · ${t('monetization.pro.pricePerMonth', {
              count: SUPPLIER_PRO_PLAN.priceStars,
            })}`}
          </Button>
        </DrawerFooter>
      </DrawerFrame>
    </Drawer>
  )
})
