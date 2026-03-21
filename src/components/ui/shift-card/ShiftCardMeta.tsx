import { CalendarDays, Clock, MapPin } from 'lucide-react'

interface ShiftCardMetaProps {
  positionText: string
  companyPlaceLine: string
  shouldHideOwnerMetaForVenue: boolean
  shouldShowMetaRow: boolean
  isVacancyCard: boolean
  locationText: string
  hasDate: boolean
  hasTime: boolean
  date?: string | null
  time?: string | null
}

export const ShiftCardMeta = ({
  positionText,
  companyPlaceLine,
  shouldHideOwnerMetaForVenue,
  shouldShowMetaRow,
  isVacancyCard,
  locationText,
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

          <p className="text-sm text-muted-foreground truncate mb-2">{companyPlaceLine}</p>
        </>
      ) : null}

      {shouldShowMetaRow ? (
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 min-h-[1.25rem]">
          {isVacancyCard ? (
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="font-medium text-foreground truncate">{locationText}</span>
            </span>
          ) : (
            <>
              {hasDate ? (
                <span className="flex items-center gap-1.5 min-w-0">
                  <CalendarDays className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="font-medium text-foreground truncate">{date}</span>
                </span>
              ) : null}
              {hasTime ? (
                <span className="flex items-center gap-1.5 min-w-0">
                  <Clock className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="font-medium text-foreground truncate">{time}</span>
                </span>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </>
  )
}
