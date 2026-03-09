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
  supplierType: string
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
        <div className="min-w-0 space-y-1">
          <p className="truncate font-semibold text-foreground">{supplier.name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>{supplier.averageRating.toFixed(1)}</span>
          </div>
        </div>
        <Badge variant={supplier.status === 'active' ? 'tagActive' : 'tag'}>
          {supplier.status === 'active'
            ? t('venueUi.suppliers.status.active', { defaultValue: 'Активен' })
            : t('venueUi.suppliers.status.paused', { defaultValue: 'Пауза' })}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="tag">{supplier.supplierType}</Badge>
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

      {supplier.bio ? (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{supplier.bio}</p>
      ) : null}

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
        <p className="inline-flex items-center gap-2 truncate">
          <Phone className="h-4 w-4 shrink-0" />
          <span className="truncate">{supplier.phone}</span>
        </p>
        <p className="inline-flex items-center gap-2 truncate">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">{supplier.email}</span>
        </p>
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
