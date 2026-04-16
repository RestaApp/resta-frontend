import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AtSign, Building2, Globe, Mail, MapPin, Phone, Star, Truck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { SupplierCardData } from '@/components/ui/shift-card/SupplierCard'
import { DetailRow } from './DetailRow'
import { TextCard } from './TextCard'
import { DETAIL_CARD_CLASS } from './constants'
import { DetailsScreenFrame } from './DetailsScreenFrame'
import { formatServiceCategory } from './formatServiceCategory'
import { normalizeExternalUrl } from '@/utils/externalUrl'

interface SupplierDetailsScreenProps {
  supplier: SupplierCardData | null
  isOpen: boolean
  onClose: () => void
}

export const SupplierDetailsScreen = memo(
  ({ supplier, isOpen, onClose }: SupplierDetailsScreenProps) => {
    const { t } = useTranslation()
    const notSpecified = t('common.notSpecified', { defaultValue: 'Не указано' })

    const locationText = useMemo(() => {
      if (!supplier) return ''
      const city = supplier.city.trim()
      const location = supplier.location.trim()
      if (location && location !== city) return location
      return city
    }, [supplier])

    const phoneHref = useMemo(() => {
      if (!supplier) return null
      const normalized = supplier.phone.replace(/[^\d+]/g, '')
      return normalized ? `tel:${normalized}` : null
    }, [supplier])

    const emailHref = useMemo(() => {
      if (!supplier) return null
      const value = supplier.email.trim()
      if (!value || !value.includes('@')) return null
      return `mailto:${value}`
    }, [supplier])

    const usernameValue = useMemo(() => {
      if (!supplier?.username) return null
      return supplier.username.replace(/^@+/, '')
    }, [supplier])

    const telegramHref = useMemo(() => {
      if (!usernameValue) return null
      return `https://t.me/${usernameValue}`
    }, [usernameValue])

    const mapHref = useMemo(() => {
      const value = locationText.trim()
      if (!value) return null
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`
    }, [locationText])

    const websiteValue = useMemo(() => supplier?.website?.trim() || '', [supplier?.website])
    const websiteHref = useMemo(
      () => (websiteValue ? normalizeExternalUrl(websiteValue) : null),
      [websiteValue]
    )

    if (!supplier) return null

    return (
      <DetailsScreenFrame
        open={isOpen}
        onOpenChange={open => {
          if (!open) onClose()
        }}
        onClose={onClose}
        closeAriaLabel={t('common.close')}
        title={
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-11 w-11">
              <AvatarImage src={supplier.photoUrl} alt={supplier.name} />
              <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                {supplier.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{supplier.name}</span>
          </div>
        }
        headerMeta={
          <>
            <Badge variant="tag" className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              {supplier.averageRating.toFixed(1)} · {supplier.totalReviews}
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
          </>
        }
      >
        <Card className={DETAIL_CARD_CLASS}>
          <div className="space-y-4">
            <DetailRow
              icon={Building2}
              iconVariant="section"
              label={t('venueUi.suppliers.filters.type', { defaultValue: 'Тип поставщика' })}
              value={supplier.supplierCategory}
            />
            <DetailRow
              icon={Phone}
              iconVariant="section"
              label={t('profile.phone', { defaultValue: 'Телефон' })}
              value={
                phoneHref ? (
                  <a
                    href={phoneHref}
                    className="text-primary hover:underline"
                    onClick={event => event.stopPropagation()}
                  >
                    {supplier.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{notSpecified}</span>
                )
              }
            />
            <DetailRow
              icon={Mail}
              iconVariant="section"
              label={t('profile.email', { defaultValue: 'Email' })}
              value={
                emailHref ? (
                  <a
                    href={emailHref}
                    className="text-primary hover:underline"
                    onClick={event => event.stopPropagation()}
                  >
                    {supplier.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{notSpecified}</span>
                )
              }
            />
            <DetailRow
              icon={MapPin}
              iconVariant="section"
              label={t('common.location', { defaultValue: 'Локация' })}
              value={
                mapHref ? (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary hover:underline"
                    onClick={event => event.stopPropagation()}
                  >
                    {locationText}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{notSpecified}</span>
                )
              }
            />
            {websiteValue ? (
              <DetailRow
                icon={Globe}
                iconVariant="section"
                label={t('profile.venueWebsite', { defaultValue: 'Сайт' })}
                value={
                  <a
                    href={websiteHref ?? '#'}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary hover:underline"
                    onClick={event => event.stopPropagation()}
                  >
                    {websiteValue}
                  </a>
                }
              />
            ) : null}
            {usernameValue && telegramHref ? (
              <DetailRow
                icon={AtSign}
                iconVariant="section"
                label={t('profile.username', { defaultValue: 'Username' })}
                value={
                  <a
                    href={telegramHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary hover:underline"
                    onClick={event => event.stopPropagation()}
                  >
                    @{usernameValue}
                  </a>
                }
              />
            ) : null}
          </div>
        </Card>

        {supplier.serviceCategories.length > 0 ? (
          <Card className={DETAIL_CARD_CLASS}>
            <h2 className="text-base font-medium text-foreground mb-3">
              {t('venueUi.suppliers.filters.categories', {
                defaultValue: 'Категории товаров и услуг',
              })}
            </h2>
            <div className="flex flex-wrap gap-2">
              {supplier.serviceCategories.map(category => (
                <Badge key={category} variant="tag" className="font-normal">
                  {t(`labels.supplierType.${category}`, {
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
      </DetailsScreenFrame>
    )
  }
)

SupplierDetailsScreen.displayName = 'SupplierDetailsScreen'
