import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Mail, MapPin, Phone, Star, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Drawer, DrawerCloseButton, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import type { SupplierCardData } from '@/components/ui/shift-card/SupplierCard'
import { DetailRow } from './DetailRow'
import { TextCard } from './TextCard'
import { DETAIL_CARD_CLASS } from './constants'

interface SupplierDetailsScreenProps {
  supplier: SupplierCardData | null
  isOpen: boolean
  onClose: () => void
}

const formatServiceCategory = (value: string): string => value.split('_').join(' ').trim()

export const SupplierDetailsScreen = memo(
  ({ supplier, isOpen, onClose }: SupplierDetailsScreenProps) => {
    const { t } = useTranslation()

    const locationText = useMemo(() => {
      if (!supplier) return ''
      return supplier.city !== supplier.location ? supplier.location : supplier.city
    }, [supplier])

    if (!supplier) return null

    return (
      <Drawer
        open={isOpen}
        onOpenChange={open => {
          if (!open) onClose()
        }}
      >
        <div
          className="flex flex-col rounded-t-2xl bg-background min-h-0 shrink-0"
          style={{ height: 'calc(85vh - 52px)' }}
        >
          <DrawerHeader className="pb-4 pt-1 border-b border-border shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <DrawerTitle className="text-xl font-semibold break-words text-foreground">
                  {supplier.name}
                </DrawerTitle>
                <p className="text-sm text-muted-foreground mt-1">{supplier.supplierType}</p>
              </div>
              <DrawerCloseButton onClick={onClose} ariaLabel={t('common.close')} />
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <Badge variant={supplier.status === 'active' ? 'tagActive' : 'tag'}>
                {supplier.status === 'active'
                  ? t('venueUi.suppliers.status.active', { defaultValue: 'Активен' })
                  : t('venueUi.suppliers.status.paused', { defaultValue: 'Пауза' })}
              </Badge>
              <Badge variant="tag" className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                {supplier.averageRating.toFixed(1)}
              </Badge>
              <Badge
                variant={supplier.deliveryAvailable ? 'tagActive' : 'tag'}
                className="inline-flex items-center gap-1"
              >
                <Truck className="h-3.5 w-3.5" />
                {supplier.deliveryAvailable == null
                  ? t('common.notSpecified', { defaultValue: 'Не указано' })
                  : supplier.deliveryAvailable
                    ? t('venueUi.suppliers.deliveryYes', { defaultValue: 'Есть доставка' })
                    : t('venueUi.suppliers.deliveryNo', { defaultValue: 'Без доставки' })}
              </Badge>
            </div>
          </DrawerHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 pt-4 space-y-5 bg-background">
            <Card className={DETAIL_CARD_CLASS}>
              <div className="space-y-4">
                <DetailRow
                  icon={Building2}
                  iconVariant="section"
                  label={t('venueUi.suppliers.filters.type', { defaultValue: 'Тип поставщика' })}
                  value={supplier.supplierType}
                />
                <DetailRow
                  icon={Phone}
                  iconVariant="section"
                  label={t('profile.phoneRequired', { defaultValue: 'Телефон' })}
                  value={supplier.phone}
                />
                <DetailRow
                  icon={Mail}
                  iconVariant="section"
                  label={t('profile.email', { defaultValue: 'Email' })}
                  value={supplier.email}
                />
                <DetailRow
                  icon={MapPin}
                  iconVariant="section"
                  label={t('common.location', { defaultValue: 'Локация' })}
                  value={locationText || t('common.notSpecified', { defaultValue: 'Не указано' })}
                />
              </div>
            </Card>

            {supplier.serviceCategories.length > 0 ? (
              <Card className={DETAIL_CARD_CLASS}>
                <h2 className="text-base font-medium text-foreground mb-3">
                  {t('venueUi.suppliers.filters.categories', { defaultValue: 'Категории услуг' })}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {supplier.serviceCategories.map(category => (
                    <Badge key={category} variant="tag" className="font-normal">
                      {t(`labels.serviceCategory.${category}`, {
                        defaultValue: formatServiceCategory(category),
                      })}
                    </Badge>
                  ))}
                </div>
              </Card>
            ) : null}

            {supplier.bio ? (
              <TextCard
                icon={Building2}
                title={t('common.description', { defaultValue: 'Описание' })}
                content={supplier.bio}
              />
            ) : null}
          </div>
        </div>
      </Drawer>
    )
  }
)

SupplierDetailsScreen.displayName = 'SupplierDetailsScreen'
