import { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AVATAR_LG_CLASS, AVATAR_SHAPE_CLASS } from '@/components/ui/avatar-styles'
import { HERO_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { cn } from '@/shared/utils/cn'
import { getAvatarInitials } from '@/shared/utils/avatarInitials'

interface EditProfileAvatarProps {
  photoUrl?: string | null
  name: string
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
          <span className={cn(HERO_TITLE_CLASS, 'text-white')}>{getAvatarInitials(name)}</span>
        </AvatarFallback>
      </Avatar>
    </div>
  )
})
