import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ContactRound, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerBody, DrawerFooter, DrawerFrame } from '@/components/ui/drawer'
import { DrawerTitleBar } from '@/components/ui/drawer-title-bar'
import { ICON_MD_CLASS } from '@/shared/constants/role-icons'
import { useToast } from '@/shared/lib/hooks/useToast'
import type { ContactRevealPurchaseType } from '@/shared/lib/monetization/paymentRequired'
import { openTelegramInvoice } from '@/shared/utils/telegram'
import { triggerHapticFeedback } from '@/shared/utils/haptics'
import { usePurchaseCheckoutMutation } from '@/services/api/purchasesApi'

interface ContactRevealPackagesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPurchased: () => Promise<void>
}

const PACKAGES: Array<{ type: ContactRevealPurchaseType; quantity: number }> = [
  { type: 'contact_reveal_pack_10', quantity: 10 },
  { type: 'contact_reveal_pack_30', quantity: 30 },
  { type: 'contact_reveal_pack_50', quantity: 50 },
]

export const ContactRevealPackagesDrawer = memo(function ContactRevealPackagesDrawer({
  open,
  onOpenChange,
  onPurchased,
}: ContactRevealPackagesDrawerProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [checkout] = usePurchaseCheckoutMutation()
  const [selectedType, setSelectedType] = useState<ContactRevealPurchaseType | null>(null)

  const handlePurchase = async (purchaseType: ContactRevealPurchaseType) => {
    setSelectedType(purchaseType)
    try {
      const { data } = await checkout({ purchase_type: purchaseType }).unwrap()
      const status = await openTelegramInvoice(data.invoice_url)
      if (status === 'paid') {
        triggerHapticFeedback('success')
        await onPurchased()
        onOpenChange(false)
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
    } catch {
      showToast(t('monetization.purchase.error'), 'error')
    } finally {
      setSelectedType(null)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} preventClose={selectedType != null}>
      <DrawerFrame>
        <DrawerTitleBar
          title={t('monetization.contactReveal.title')}
          onClose={() => onOpenChange(false)}
        />

        <DrawerBody className="flex flex-col gap-4 pb-4 pt-2">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ContactRound className={ICON_MD_CLASS} aria-hidden="true" />
            </span>
            <p className="text-sm text-muted-foreground">
              {t('monetization.contactReveal.packageDescription')}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {PACKAGES.map(item => (
              <Button
                key={item.type}
                type="button"
                variant="outline"
                size="md"
                className="w-full justify-between"
                loading={selectedType === item.type}
                disabled={selectedType != null}
                onClick={() => void handlePurchase(item.type)}
              >
                {t('monetization.contactReveal.package', { count: item.quantity })}
                <Star className="h-4 w-4 text-primary" aria-hidden="true" />
              </Button>
            ))}
          </div>
        </DrawerBody>

        <DrawerFooter>
          <p className="text-center text-xs text-muted-foreground">
            {t('monetization.contactReveal.invoicePriceHint')}
          </p>
        </DrawerFooter>
      </DrawerFrame>
    </Drawer>
  )
})
