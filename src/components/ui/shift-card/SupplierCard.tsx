import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Star, Truck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_FALLBACK_CLASS, AVATAR_SM_CLASS } from '@/components/ui/avatar-styles'
import { Badge } from '@/components/ui/badge'
import {
  PREVIEW_CARD_STATS_CLASS,
  PREVIEW_CARD_TAGS_CLASS,
  PreviewCardLayout,
} from '@/components/ui/shift-card/PreviewCardLayout'
import {
  SHIFT_CARD_SUB_CLASS,
  SHIFT_CARD_TITLE_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import { formatServiceCategory } from '@/shared/utils/formatServiceCategory'
import { cn } from '@/shared/utils/cn'

export interface SupplierCardData {
  id: number
  name: string
  bio: string | null
  website: string
  city: string
  location: string[]
  email: string
  phone: string
  averageRating: number
  totalReviews: number
  photoUrl: string | null
  supplierType: string
  supplierCategory: string
  serviceCategories: string[]
  deliveryAvailable: boolean | null
  status: 'active' | 'paused'
}

interface SupplierCardProps {
  supplier: SupplierCardData
  onOpenDetails: (id: number) => void
  mode?: 'suppliers' | 'restaurants'
}

const SupplierCardComponent = ({
  supplier,
  onOpenDetails,
  mode = 'suppliers',
}: SupplierCardProps) => {
  const { t } = useTranslation()
  const notSpecified = t('common.notSpecified', { defaultValue: 'Не указано' })
  const isRestaurantsMode = mode === 'restaurants'

  const { locationText, extraLocationsLabel } = useMemo(() => {
    const city = supplier.city.trim()
    const points = supplier.location.map(line => line.trim()).filter(Boolean)
    const firstAddress = points[0] ?? ''

    if (isRestaurantsMode && points.length > 1) {
      const moreLocationsLabel = t('supplierUi.restaurants.moreLocations', {
        count: points.length - 1,
        defaultValue: '+{{count}}',
      })
      return {
        locationText: firstAddress,
        extraLocationsLabel: moreLocationsLabel,
      }
    }

    if (firstAddress && firstAddress !== city)
      return { locationText: firstAddress, extraLocationsLabel: null }
    if (city) return { locationText: city, extraLocationsLabel: null }
    return { locationText: notSpecified, extraLocationsLabel: null }
  }, [isRestaurantsMode, notSpecified, supplier.city, supplier.location, t])

  const hasRating = supplier.averageRating > 0
  const normalizedRating = hasRating ? Math.min(5, Math.max(0, supplier.averageRating)) : 0
  const subtitleText =
    isRestaurantsMode || !supplier.supplierCategory.trim()
      ? supplier.supplierType
      : supplier.supplierCategory

  const categoryTags = useMemo(() => {
    const labelPrefix = isRestaurantsMode ? 'labels.cuisineType' : 'labels.supplierType'
    return supplier.serviceCategories
      .map(category => {
        const key = `${labelPrefix}.${category}`
        const label = t(key, { defaultValue: formatServiceCategory(category) })
        return label === key ? formatServiceCategory(category) : label
      })
      .filter(Boolean)
  }, [isRestaurantsMode, supplier.serviceCategories, t])

  const deliveryLabel =
    supplier.deliveryAvailable == null
      ? notSpecified
      : supplier.deliveryAvailable
        ? t('venueUi.suppliers.deliveryYes', { defaultValue: 'Есть доставка' })
        : t('venueUi.suppliers.deliveryNo', { defaultValue: 'Без доставки' })

  const showDeliveryIcon = !isRestaurantsMode && supplier.deliveryAvailable !== null

  return (
    <PreviewCardLayout
      interactive
      ariaLabel={t('shift.openVenueProfile', {
        name: supplier.name,
        defaultValue: 'Открыть профиль {{name}}',
      })}
      onActivate={() => onOpenDetails(supplier.id)}
      topRight={
        showDeliveryIcon ? (
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center',
              supplier.deliveryAvailable ? 'text-primary' : 'text-muted-foreground'
            )}
            title={deliveryLabel}
            aria-label={deliveryLabel}
          >
            <Truck className="h-4 w-4 shrink-0" aria-hidden />
          </span>
        ) : undefined
      }
      avatar={
        <Avatar className={AVATAR_SM_CLASS}>
          <AvatarImage src={supplier.photoUrl ?? undefined} alt={supplier.name} />
          <AvatarFallback className={AVATAR_FALLBACK_CLASS}>
            {supplier.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      }
    >
      <p className={cn(SHIFT_CARD_TITLE_CLASS, 'truncate')}>{supplier.name}</p>
      <p className={cn(SHIFT_CARD_SUB_CLASS, 'truncate')}>{subtitleText}</p>

      <div className={PREVIEW_CARD_STATS_CLASS}>
        {!isRestaurantsMode && hasRating ? (
          <span className="inline-flex items-center gap-1" aria-label={t('common.rating')}>
            <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" aria-hidden />
            {t('shift.ownerReviewsSummary', {
              rating: normalizedRating.toFixed(1),
              count: supplier.totalReviews,
            })}
          </span>
        ) : null}
        <span className="inline-flex min-w-0 items-center gap-1">
          <MapPin className={ICON_SM_CLASS} aria-hidden />
          <span className="min-w-0 flex items-center gap-1">
            <span className="truncate">{locationText}</span>
            {extraLocationsLabel ? (
              <Badge
                variant="tag"
                className="shrink-0 px-1.5 py-0 text-xs font-bold text-primary border-primary/30 bg-primary/10"
              >
                {extraLocationsLabel}
              </Badge>
            ) : null}
          </span>
        </span>
      </div>

      {categoryTags.length > 0 ? (
        <div className={PREVIEW_CARD_TAGS_CLASS}>
          {categoryTags.map(tag => (
            <Badge key={tag} variant="tag">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
    </PreviewCardLayout>
  )
}

export const SupplierCard = memo(SupplierCardComponent)
SupplierCard.displayName = 'SupplierCard'
