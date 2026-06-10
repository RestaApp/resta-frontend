import { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AVATAR_LG_CLASS, AVATAR_SHAPE_CLASS } from '@/components/ui/avatar-styles'
import { HERO_TITLE_CLASS, SCREEN_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { SHIFT_CARD_META_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'
import { getAvatarInitials } from '@/shared/utils/avatarInitials'

type VenueProfileHeroUser = {
  profile_photo_url?: string | null
  photo_url?: string | null
  city?: string | null
  username?: string | null
}

interface VenueProfileHeroProps {
  userProfile: VenueProfileHeroUser
  userName: string
  roleLabel: string
  isHiringOpen: boolean
  hiringOpenLabel: string
}

export const VenueProfileHero = memo(function VenueProfileHero({
  userProfile,
  userName,
  roleLabel,
  isHiringOpen,
  hiringOpenLabel,
}: VenueProfileHeroProps) {
  const photoUrl = userProfile.photo_url || userProfile.profile_photo_url || null
  const city = userProfile.city?.trim()
  const username = userProfile.username?.trim()
  const locationLine = [city, roleLabel].filter(Boolean).join(' • ')

  return (
    <div className="flex items-start gap-4 py-1">
      <Avatar className={AVATAR_LG_CLASS}>
        <AvatarImage src={photoUrl} alt={userName} />
        <AvatarFallback className={cn(AVATAR_SHAPE_CLASS, 'bg-[image:var(--gradient-primary)]')}>
          <span className={cn(HERO_TITLE_CLASS, 'text-white')}>{getAvatarInitials(userName)}</span>
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <h1 className={cn(SCREEN_TITLE_CLASS, 'mb-1')}>{userName}</h1>

        {username ? <div className={cn(SHIFT_CARD_META_CLASS, 'truncate')}>@{username}</div> : null}

        {locationLine ? (
          <div className={cn(SHIFT_CARD_META_CLASS, 'mt-0.5 truncate')}>{locationLine}</div>
        ) : null}

        {isHiringOpen ? (
          <Badge variant="ok" className="mt-2 normal-case tracking-normal">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            {hiringOpenLabel}
          </Badge>
        ) : null}
      </div>
    </div>
  )
})
