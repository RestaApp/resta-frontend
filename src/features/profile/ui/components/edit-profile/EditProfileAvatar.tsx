import { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_LG_CLASS, AVATAR_SHAPE_CLASS } from '@/components/ui/avatar-styles'
import { HERO_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'

interface EditProfileAvatarProps {
  photoUrl?: string | null
  name: string
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

export const EditProfileAvatar = memo(function EditProfileAvatar({
  photoUrl,
  name,
}: EditProfileAvatarProps) {
  return (
    <div className="flex justify-center py-2">
      <Avatar className={AVATAR_LG_CLASS}>
        <AvatarImage src={photoUrl ?? undefined} alt={name} />
        <AvatarFallback className={cn(AVATAR_SHAPE_CLASS, 'bg-[image:var(--gradient-primary)]')}>
          <span className={cn(HERO_TITLE_CLASS, 'text-white')}>{getInitials(name)}</span>
        </AvatarFallback>
      </Avatar>
    </div>
  )
})
