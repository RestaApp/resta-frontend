import { Calendar, Clock, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { RoleTheme } from '@/shared/lib/role-theme'
import { cn } from '@/utils/cn'

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
  isEmployeeCard?: boolean
  accentRole?: RoleTheme | null
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
  isEmployeeCard = false,
  accentRole = null,
}: ShiftCardMetaProps) => {
  const { t } = useTranslation()
  const extraLocationsLabel =
    extraLocationsCount > 0
      ? t('supplierUi.restaurants.moreLocations', {
          count: extraLocationsCount,
          defaultValue: '+{{count}}',
        })
      : null

  const subtitle = [restaurantName.trim(), isEmployeeCard ? positionText : '']
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      {!shouldHideOwnerMetaForVenue ? (
        <>
          {!isEmployeeCard ? (
            <p className="text-sm text-muted-foreground truncate mb-1">{positionText}</p>
          ) : null}
          {subtitle ? (
            <p
              className={cn(
                'truncate text-sm leading-snug',
                isEmployeeCard && accentRole ? 'mb-3.5' : 'mb-2',
                isEmployeeCard && accentRole
                  ? cn(accentRole.classes.text, 'opacity-95')
                  : 'text-muted-foreground'
              )}
            >
              {onOpenRestaurant ? (
                <button
                  type="button"
                  className={cn(
                    'hover:underline',
                    isEmployeeCard && accentRole
                      ? cn(accentRole.classes.text, 'opacity-95')
                      : 'text-primary'
                  )}
                  onClick={event => {
                    event.stopPropagation()
                    onOpenRestaurant()
                  }}
                >
                  {subtitle}
                </button>
              ) : (
                subtitle
              )}
              {isVacancyCard && locationText.trim() && !shouldShowMetaRow
                ? ` · ${locationText}`
                : ''}
            </p>
          ) : null}
        </>
      ) : null}

      {shouldShowMetaRow ? (
        <div className="mb-0 flex min-h-[1.25rem] items-center gap-4 text-body-md text-muted-foreground">
          {isVacancyCard ? (
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex items-center gap-1.5">
                <span className="font-mono-resta text-xs font-medium text-foreground truncate">
                  {locationText}
                </span>
                {extraLocationsLabel ? (
                  <Badge
                    variant="tag"
                    className="shrink-0 px-1.5 py-0 text-meta font-semibold text-primary border-primary/30 bg-primary/10"
                  >
                    {extraLocationsLabel}
                  </Badge>
                ) : null}
              </span>
            </span>
          ) : (
            <>
              {isEmployeeCard ? (
                <div className="flex w-full items-center gap-4">
                  {hasTime ? (
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Clock
                        className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground"
                        aria-hidden
                      />
                      <span className="font-mono-resta text-xs font-medium text-foreground truncate">
                        {time}
                      </span>
                    </span>
                  ) : null}
                  {locationText.trim() ? (
                    <span className="flex items-center gap-1.5 min-w-0">
                      <MapPin
                        className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground"
                        aria-hidden
                      />
                      <span className="font-mono-resta text-xs font-medium text-foreground truncate">
                        {locationText}
                      </span>
                    </span>
                  ) : null}
                </div>
              ) : (
                <div className="flex w-full items-center justify-between gap-3">
                  {hasDate ? (
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Calendar
                        className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground"
                        aria-hidden
                      />
                      <span className="font-mono-resta text-xs font-medium text-foreground truncate">
                        {date}
                      </span>
                    </span>
                  ) : null}
                  {hasTime ? (
                    <span className="flex items-center justify-end gap-1.5 min-w-0 ml-auto">
                      <Clock
                        className="h-4 w-4 shrink-0 stroke-[1.5] text-muted-foreground"
                        aria-hidden
                      />
                      <span className="font-mono-resta text-xs font-medium text-foreground truncate">
                        {time}
                      </span>
                    </span>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      ) : null}
    </>
  )
}
