export const getAvatarInitials = (name: string): string => {
  const parts = name
    .replace(/[^\p{L}\p{N}\s.-]/gu, '')
    .split(/\s+/)
    .map(part => part.replace(/\./g, '').trim())
    .filter(Boolean)

  if (parts.length === 0) return 'R'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}
