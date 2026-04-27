import { Calendar, Clock, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

interface ShiftCardMetaProps {
  positionText: string
  restaurantName: string
  locationText: string
  extraLocationsCount: number
  onOpenRestaurant?: () => void
  shouldHideOwnerMetaForVenue: boolean
  shouldShowMetaRow: boolean
  isVacancyCard: boolean
  hasDate: boolean
  hasTime: boolean
  date?: string | null
  time?: string | null
}

export const ShiftCardMeta = ({
  positionText,
  restaurantName,
  locationText,
  extraLocationsCount,
  onOpenRestaurant,
  shouldHideOwnerMetaForVenue,
  shouldShowMetaRow,
  isVacancyCard,
  hasDate,
  hasTime,
  date,
  time,
}: ShiftCardMetaProps) => {
  const { t } = useTranslation()
  const extraLocationsLabel =
    extraLocationsCount > 0
      ? t('supplierUi.restaurants.moreLocations', {
          count: extraLocationsCount,
          defaultValue: '+{{count}}',
        })
      : null

  return (
    <>
      {!shouldHideOwnerMetaForVenue ? (
        <>
          <p className="text-sm text-muted-foreground truncate mb-1">{positionText}</p>
          {restaurantName.trim() ? (
            <p className="text-sm text-muted-foreground truncate mb-2">
              {onOpenRestaurant ? (
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={event => {
                    event.stopPropagation()
                    onOpenRestaurant()
                  }}
                >
                  {restaurantName}
                </button>
              ) : (
                restaurantName
              )}
              {isVacancyCard && locationText.trim() && !shouldShowMetaRow
                ? ` · ${locationText}`
                : ''}
            </p>
          ) : null}
        </>
      ) : null}

      {shouldShowMetaRow ? (
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 min-h-[1.25rem]">
          {isVacancyCard ? (
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex items-center gap-1.5">
                <span className="font-mono-resta text-xs font-medium text-foreground truncate">{locationText}</span>
                {extraLocationsLabel ? (
                  <Badge
                    variant="tag"
                    className="shrink-0 px-1.5 py-0 text-[11px] font-semibold text-primary border-primary/30 bg-primary/10"
                  >
                    {extraLocationsLabel}
                  </Badge>
                ) : null}
              </span>
            </span>
          ) : (
            <div className="flex w-full items-center justify-between gap-3">
              {hasDate ? (
                <span className="flex items-center gap-1.5 min-w-0">
                  <Calendar
                    className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground"
                    aria-hidden
                  />
                  <span className="font-mono-resta text-xs font-medium text-foreground truncate">{date}</span>
                </span>
              ) : null}
              {hasTime ? (
                <span className="flex items-center justify-end gap-1.5 min-w-0 ml-auto">
                  <Clock
                    className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground"
                    aria-hidden
                  />
                  <span className="font-mono-resta text-xs font-medium text-foreground truncate">{time}</span>
                </span>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </>
  )
}
