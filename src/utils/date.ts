export const toMinutes = (value: string): number | null => {
  if (!value) return null
  const [hoursStr, minutesStr] = value.split(':')
  const hours = Number(hoursStr)
  const minutes = Number(minutesStr)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

export const buildDateTime = (dateValue: string, timeValue: string): string => {
  return new Date(`${dateValue}T${timeValue}:00`).toISOString()
}


