import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import { formatServiceCategory } from '@/components/ui/shift-details-screen/formatServiceCategory'

export interface SupplierCardData {
  id: number
  name: string
  bio: string | null
  city: string
  location: string
  email: string
  phone: string
  averageRating: number
  totalReviews: number
  username: string | null
  supplierType: string
  supplierCategory: string
  serviceCategories: string[]
  deliveryAvailable: boolean | null
  status: 'active' | 'paused'
}

interface SupplierCardProps {
  supplier: SupplierCardData
  onOpenDetails: (id: number) => void
}

const SupplierCardComponent = ({ supplier, onOpenDetails }: SupplierCardProps) => {
  const { t } = useTranslation()
  const notSpecified = t('common.notSpecified', { defaultValue: 'Не указано' })

  const locationText = useMemo(() => {
    const city = supplier.city.trim()
    const location = supplier.location.trim()
    if (location && location !== city) return location
    if (city) return city
    return notSpecified
  }, [notSpecified, supplier.city, supplier.location])

  const ariaLabel = useMemo(
    () => [supplier.name, supplier.supplierType, supplier.city].filter(Boolean).join(', '),
    [supplier.city, supplier.name, supplier.supplierType]
  )

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
        'group relative rounded-xl p-4 border bg-card transition-all duration-200 cursor-pointer active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'border-[var(--surface-stroke-soft)] shadow-sm hover:[box-shadow:var(--surface-shadow-soft)]',
        'hover:border-[var(--surface-stroke-soft-hover)] dark:shadow-none'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{supplier.name}</p>
        </div>
        <span
          className={cn(
            'relative inline-flex h-9 w-9 items-center justify-center rounded-full border',
            supplier.deliveryAvailable === true
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-muted/30 text-muted-foreground'
          )}
          aria-label={
            supplier.deliveryAvailable == null
              ? notSpecified
              : supplier.deliveryAvailable
                ? t('venueUi.suppliers.deliveryYes', { defaultValue: 'Есть доставка' })
                : t('venueUi.suppliers.deliveryNo', { defaultValue: 'Без доставки' })
          }
          title={
            supplier.deliveryAvailable == null
              ? notSpecified
              : supplier.deliveryAvailable
                ? t('venueUi.suppliers.deliveryYes', { defaultValue: 'Есть доставка' })
                : t('venueUi.suppliers.deliveryNo', { defaultValue: 'Без доставки' })
          }
        >
          <Truck className="h-4 w-4" />
          {supplier.deliveryAvailable === false ? (
            <span className="absolute h-[2px] w-6 rotate-[-30deg] rounded-full bg-current" />
          ) : null}
        </span>
        {/* <div className="shrink-0 flex flex-col items-end leading-tight text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4" />
            {supplier.averageRating.toFixed(1)}
          </span>
          <span className="text-sm">
            {supplier.totalReviews} {t('common.reviews', { defaultValue: 'отзывов' })}
          </span>
        </div> */}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="tag">{supplier.supplierCategory}</Badge>
      </div>

      {supplier.serviceCategories.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {supplier.serviceCategories.slice(0, 3).map(category => (
            <Badge key={category} variant="tag" className="font-normal">
              {t(`labels.supplierType.${category}`, {
                defaultValue: formatServiceCategory(category),
              })}
            </Badge>
          ))}
          {supplier.serviceCategories.length > 3 ? (
            <Badge variant="tag" className="font-normal">
              +{supplier.serviceCategories.length - 3}
            </Badge>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        <p className="inline-flex items-center gap-2 truncate">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{locationText}</span>
        </p>
      </div>
    </div>
  )
}

export const SupplierCard = memo(SupplierCardComponent)
SupplierCard.displayName = 'SupplierCard'
