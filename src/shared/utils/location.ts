export const parseLocation = (location: string): { city: string; address: string } => {
  if (!location.trim()) return { city: '', address: '' }
  const commaIndex = location.indexOf(',')
  if (commaIndex === -1) {
    return { city: '', address: location }
  }
  const city = location.substring(0, commaIndex).trim()
  const address = location.substring(commaIndex + 1).trimStart()
  return { city, address }
}

export const combineLocation = (city: string, address: string): string => {
  const c = city.trim()
  const a = address.trimStart()
  if (!c && !a) return ''
  if (!c) return a
  if (!a.trim()) return c
  return `${c}, ${a}`
}

export const splitLocationPoints = (location?: string | null): string[] => {
  if (!location) return []
  return location
    .split(/\r?\n+/)
    .map(value => value.trim())
    .filter(Boolean)
}
