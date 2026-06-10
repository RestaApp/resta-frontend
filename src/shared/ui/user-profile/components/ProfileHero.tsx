import { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_LG_CLASS, AVATAR_SHAPE_CLASS } from '@/components/ui/avatar-styles'
import {
  DISPLAY_PRICE_CLASS,
  HERO_TITLE_CLASS,
  SCREEN_TITLE_CLASS,
} from '@/components/ui/ui-patterns'
import { SHIFT_CARD_META_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'

type ProfileHeroUser = {
  profile_photo_url?: string | null
  photo_url?: string | null
  city?: string | null
  location?: string[] | null
  username?: string | null
  average_rating?: number | string | null
}

interface ProfileHeroProps {
  userProfile: ProfileHeroUser
  userName: string
  roleLabel: string
}

const getInitials = (name: string) => {
  const parts = name
    .replace(/[^\p{L}\p{N}\s.-]/gu, '')
    .split(/\s+/)
    .map(part => part.replace(/\./g, '').trim())
    .filter(Boolean)

  if (parts.length === 0) return 'R'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

const normalizeRating = (value: number | string | null | undefined) => {
  const rating = Number(value)
  return Number.isFinite(rating) && rating > 0 ? Math.min(5, Math.max(0, rating)) : null
}

export const ProfileHero = memo(({ userProfile, userName, roleLabel }: ProfileHeroProps) => {
  const photoUrl = userProfile.photo_url || userProfile.profile_photo_url || null
  const firstLocation = userProfile.location?.find(line => line.trim().length > 0)
  const cityOrLocation = userProfile.city || firstLocation
  const username = userProfile.username?.trim()
  const rating = normalizeRating(userProfile.average_rating)
  const ratingPercent = rating ? (rating / 5) * 100 : 0
  const metaItems = [username ? `@${username}` : null, cityOrLocation, roleLabel].filter(Boolean)

  const content = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Avatar className={AVATAR_LG_CLASS}>
          <AvatarImage src={photoUrl} alt={userName} />
          <AvatarFallback className={cn(AVATAR_SHAPE_CLASS, 'bg-[image:var(--gradient-primary)]')}>
            <span className={cn(HERO_TITLE_CLASS, 'text-white')}>{getInitials(userName)}</span>
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex min-w-0 items-center gap-2">
            <h1 className={SCREEN_TITLE_CLASS}>{userName}</h1>
          </div>

          <div className={cn(SHIFT_CARD_META_CLASS, 'min-w-0')}>
            {metaItems.length > 0 ? metaItems.join(' · ') : roleLabel}
          </div>
        </div>
      </div>

      {rating ? (
        <div
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full p-1.5"
          style={{
            background: `conic-gradient(var(--success) ${ratingPercent}%, rgba(255,255,255,0.08) 0)`,
          }}
          aria-label={`Рейтинг ${rating.toFixed(1)}`}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
            <span className={DISPLAY_PRICE_CLASS}>{rating.toFixed(1)}</span>
          </div>
        </div>
      ) : null}
    </div>
  )

  return <div className="relative py-1">{content}</div>
})
ProfileHero.displayName = 'ProfileHero'
