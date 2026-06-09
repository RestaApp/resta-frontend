export type UserNameParts = {
  full_name?: string | null
  name?: string | null
  last_name?: string | null
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
