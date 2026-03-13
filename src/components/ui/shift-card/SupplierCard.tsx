import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, MapPin, Phone, Star, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

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

const formatServiceCategory = (value: string): string => value.split('_').join(' ').trim()

const SupplierCardComponent = ({ supplier, onOpenDetails }: SupplierCardProps) => {
  const { t } = useTranslation()

  const locationText = useMemo(
    () => (supplier.city !== supplier.location ? supplier.location : supplier.city),
    [supplier.city, supplier.location]
  )

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
        <div className="shrink-0 flex flex-col items-end leading-tight text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4" />
            {supplier.averageRating.toFixed(1)}
          </span>
          <span className="text-sm">
            {supplier.totalReviews} {t('common.reviews', { defaultValue: 'отзывов' })}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="tag">{supplier.supplierCategory}</Badge>
        <Badge variant={supplier.deliveryAvailable ? 'tagActive' : 'tag'}>
          <span className="inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            {supplier.deliveryAvailable == null
              ? t('common.notSpecified', { defaultValue: 'Не указано' })
              : supplier.deliveryAvailable
                ? t('venueUi.suppliers.deliveryYes', { defaultValue: 'Есть доставка' })
                : t('venueUi.suppliers.deliveryNo', { defaultValue: 'Без доставки' })}
          </span>
        </Badge>
      </div>

      {supplier.serviceCategories.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {supplier.serviceCategories.slice(0, 3).map(category => (
            <Badge key={category} variant="tag" className="font-normal">
              {t(`labels.serviceCategory.${category}`, {
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
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 min-w-0 max-w-[48%]">
            <Phone className="h-4 w-4 shrink-0" />
            <span className="truncate">{supplier.phone}</span>
          </p>
          <p className="inline-flex items-center justify-end gap-2 min-w-0 max-w-[48%] ml-auto">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate text-right">{supplier.email}</span>
          </p>
        </div>

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
