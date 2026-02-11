export const parseLocation = (location: string): { city: string; address: string } => {
  const trimmed = location.trim()
  if (!trimmed) return { city: '', address: '' }
  const commaIndex = trimmed.indexOf(',')
  if (commaIndex === -1) {
    return { city: '', address: trimmed }
  }
  const city = trimmed.substring(0, commaIndex).trim()
  const address = trimmed.substring(commaIndex + 1).trim()
  return { city, address }
}

export const combineLocation = (city: string, address: string): string => {
  const c = city.trim()
  const a = address.trim()
  if (!c && !a) return ''
  if (!c) return a
  if (!a) return c
  return `${c}, ${a}`
}
