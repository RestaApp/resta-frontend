import type { ApiRole } from '@/shared/types/roles.types'

export type UserNameParts = {
  full_name?: string | null
  name?: string | null
  last_name?: string | null
}

export type ProfileDisplayUser = UserNameParts & {
  username?: string | null
  restaurant_profile?: { name?: string | null } | null
}

/** Имя для UI: «имя + фамилия»; full_name — если в нём уже есть фамилия. */
export const formatUserDisplayName = (user?: UserNameParts | null, fallback = ''): string => {
  if (!user) return fallback

  const fromParts = [user.name, user.last_name].filter(Boolean).join(' ').trim()
  const fullName = user.full_name?.trim()

  if (fromParts) {
    if (!fullName) return fromParts
    if (user.last_name && !fullName.includes(user.last_name)) return fromParts
    return fullName
  }

  return fullName || user.name?.trim() || fallback
}

/** Имя профиля для просмотра чужого пользователя (заведение → venue name, иначе ФИО / username). */
export const formatProfileDisplayName = (
  user: ProfileDisplayUser | null | undefined,
  apiRole: ApiRole | null,
  fallback: string
): string => {
  if (!user) return fallback
  if (apiRole === 'restaurant') {
    const venue = user.restaurant_profile?.name?.trim()
    if (venue) return venue
  }
  return formatUserDisplayName(user) || user.username?.trim() || fallback
}
