import { Calendar, Clock, MapPin } from 'lucide-react'

interface ShiftCardMetaProps {
  positionText: string
  restaurantName: string
  locationText: string
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
  onOpenRestaurant,
  shouldHideOwnerMetaForVenue,
  shouldShowMetaRow,
  isVacancyCard,
  hasDate,
  hasTime,
  date,
  time,
}: ShiftCardMetaProps) => {
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
              {isVacancyCard && locationText.trim() ? ` · ${locationText}` : ''}
            </p>
          ) : null}
        </>
      ) : null}

      {shouldShowMetaRow ? (
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 min-h-[1.25rem]">
          {isVacancyCard ? (
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground" aria-hidden />
              <span className="font-medium text-foreground truncate">{locationText}</span>
            </span>
          ) : (
            <div className="flex w-full items-center justify-between gap-3">
              {hasDate ? (
                <span className="flex items-center gap-1.5 min-w-0">
                  <Calendar
                    className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground"
                    aria-hidden
                  />
                  <span className="font-medium text-foreground truncate">{date}</span>
                </span>
              ) : null}
              {hasTime ? (
                <span className="flex items-center justify-end gap-1.5 min-w-0 ml-auto">
                  <Clock
                    className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground"
                    aria-hidden
                  />
                  <span className="font-medium text-foreground truncate">{time}</span>
                </span>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </>
  )
}
