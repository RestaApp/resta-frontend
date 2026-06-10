export { stripVacancyPrefix } from '@/shared/shifts/formatting'

export const formatDistanceKm = (distanceKm?: number | null): string | null => {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm <= 0) return null
  const rounded = distanceKm < 10 ? Math.round(distanceKm * 10) / 10 : Math.round(distanceKm)
  return `${String(rounded).replace('.', ',')} км`
}

export const positionInitial = (position: string): string => {
  const normalized = position.trim().toLowerCase()
  if (normalized === 'chef') return 'C'
  return (normalized[0] ?? 'R').toUpperCase()
}
