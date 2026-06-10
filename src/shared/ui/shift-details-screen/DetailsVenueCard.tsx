import { memo } from 'react'
import { ChevronRight, Star } from 'lucide-react'
import type { TFunction } from 'i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_FALLBACK_CLASS } from '@/components/ui/avatar-styles'
import { Card } from '@/components/ui/card'
import { ICON_SM_CLASS } from '@/shared/constants/role-icons'
import { cn } from '@/shared/utils/cn'
import { SHIFT_CARD_INTERACTIVE_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import { DETAIL_CARD_CLASS } from './constants'

interface DetailsVenueCardProps {
  name: string
  photoUrl?: string | null
  avatarFallback: string
  ratingLabel: string | null
  completedShiftsLabel?: string | null
  onOpen: () => void
  t: TFunction
}

export const DetailsVenueCard = memo(
  ({
    name,
    photoUrl,
    avatarFallback,
    ratingLabel,
    completedShiftsLabel,
    onOpen,
    t,
  }: DetailsVenueCardProps) => (
    <button
      type="button"
      data-haptic="light"
      onClick={onOpen}
      aria-label={t('shift.openVenueProfile', { name, defaultValue: 'Открыть профиль {{name}}' })}
      className="w-full text-left"
    >
      <Card
        padding="md"
        className={cn(DETAIL_CARD_CLASS, SHIFT_CARD_INTERACTIVE_CLASS, 'flex items-center gap-3')}
      >
        <Avatar className="h-14 w-14 shrink-0 rounded-md">
          <AvatarImage src={photoUrl ?? undefined} alt={name} />
          <AvatarFallback className={cn(AVATAR_FALLBACK_CLASS, 'rounded-md text-base')}>
            {avatarFallback}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-foreground">{name}</p>
          {ratingLabel ? (
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Star className={cn(ICON_SM_CLASS, 'fill-primary text-primary')} aria-hidden />
              {ratingLabel}
            </p>
          ) : null}
          {completedShiftsLabel ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{completedShiftsLabel}</p>
          ) : null}
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      </Card>
    </button>
  )
)

DetailsVenueCard.displayName = 'DetailsVenueCard'
