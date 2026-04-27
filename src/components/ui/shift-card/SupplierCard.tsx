import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Phone, Truck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

export interface SupplierCardData {
  id: number
  name: string
  bio: string | null
  website: string
  city: string
  location: string
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
    const location = supplier.location.trim()

    if (isRestaurantsMode && location) {
      const points = location
        .split(/\r?\n+/)
        .map(value => value.trim())
        .filter(Boolean)

      if (points.length > 1) {
        const moreLocationsLabel = t('supplierUi.restaurants.moreLocations', {
          count: points.length - 1,
          defaultValue: '+{{count}}',
        })
        return {
          locationText: points[0],
          extraLocationsLabel: moreLocationsLabel,
        }
      }
    }

    if (location && location !== city) return { locationText: location, extraLocationsLabel: null }
    if (city) return { locationText: city, extraLocationsLabel: null }
    return { locationText: notSpecified, extraLocationsLabel: null }
  }, [isRestaurantsMode, notSpecified, supplier.city, supplier.location, t])

  const ariaLabel = useMemo(
    () => [supplier.name, supplier.supplierType, supplier.city].filter(Boolean).join(', '),
    [supplier.city, supplier.name, supplier.supplierType]
  )
  const phoneText = supplier.phone.trim() || notSpecified
  const subtitleText =
    isRestaurantsMode || !supplier.supplierCategory.trim()
      ? supplier.supplierType
      : supplier.supplierCategory

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={() => onOpenDetails(supplier.id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenDetails(supplier.id)
        }
      }}
      className={cn(
        'group relative border bg-card transition-all duration-200 cursor-pointer active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'rounded-3xl p-4 shadow-sm border-[var(--surface-stroke-soft)] hover:[box-shadow:var(--surface-shadow-soft)]',
        'hover:border-[var(--surface-stroke-soft-hover)] dark:shadow-none'
      )}
    >
      {!isRestaurantsMode ? (
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              'relative inline-flex h-8 w-8 items-center justify-center rounded-full border',
              supplier.deliveryAvailable
                ? 'text-primary border-primary/30 bg-primary/10'
                : 'text-muted-foreground border-border bg-muted/30'
            )}
            title={
              supplier.deliveryAvailable == null
                ? t('common.notSpecified', { defaultValue: 'Не указано' })
                : supplier.deliveryAvailable
                  ? t('venueUi.suppliers.deliveryYes', { defaultValue: 'Есть доставка' })
                  : t('venueUi.suppliers.deliveryNo', { defaultValue: 'Без доставки' })
            }
            aria-label={
              supplier.deliveryAvailable == null
                ? t('common.notSpecified', { defaultValue: 'Не указано' })
                : supplier.deliveryAvailable
                  ? t('venueUi.suppliers.deliveryYes', { defaultValue: 'Есть доставка' })
                  : t('venueUi.suppliers.deliveryNo', { defaultValue: 'Без доставки' })
            }
          >
            <Truck className="h-4 w-4" />
            {supplier.deliveryAvailable === false ? (
              <span
                aria-hidden="true"
                className="absolute h-0.5 w-5 rotate-[-30deg] rounded-full bg-current"
              />
            ) : null}
          </span>
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <Avatar className="h-11 w-11 rounded-xl shrink-0 self-start">
          <AvatarImage src={supplier.photoUrl} alt={supplier.name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
            {supplier.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{supplier.name}</p>
          <p className="mt-1 text-muted-foreground">{subtitleText}</p>

          <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2.5 w-full">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex items-center gap-1.5">
                <span className="truncate">{locationText}</span>
                {extraLocationsLabel ? (
                  <Badge
                    variant="tag"
                    className="shrink-0 px-1.5 py-0 text-[11px] font-semibold text-primary border-primary/30 bg-primary/10"
                  >
                    {extraLocationsLabel}
                  </Badge>
                ) : null}
              </span>
            </p>
            <p className="inline-flex items-center gap-2.5 w-full">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="truncate">{phoneText}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const SupplierCard = memo(SupplierCardComponent)
SupplierCard.displayName = 'SupplierCard'
